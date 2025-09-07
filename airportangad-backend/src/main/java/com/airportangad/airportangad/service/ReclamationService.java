package com.airportangad.airportangad.service;

import com.airportangad.airportangad.domain.*;
import com.airportangad.airportangad.repo.ReclamationRepository;
import com.airportangad.airportangad.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReclamationService {

    private final ReclamationRepository recRepo;
    private final UserRepository userRepo;

    public ReclamationService(ReclamationRepository recRepo, UserRepository userRepo) {
        this.recRepo = recRepo;
        this.userRepo = userRepo;
    }

    /* ============================
       DTOs
       ============================ */
    public record ReclamationRequest(ServiceType service, String titre, String description, String photoBase64) {}
    public record TechReplyRequest(String commentaire, StatutReclamation statut) {}

    /* ============================
       DEMANDEUR
       ============================ */
    public Reclamation create(String demandeurUsername, ReclamationRequest req) {
        User dem = userRepo.findByUsername(demandeurUsername)
                .orElseThrow(() -> new IllegalArgumentException("Demandeur introuvable"));
        if (dem.getRole() != Role.DEMANDEUR) {
            throw new IllegalArgumentException("Utilisateur non DEMANDEUR");
        }

        Reclamation r = new Reclamation();
        r.setService(req.service());
        r.setTitre(req.titre());
        r.setDescription(req.description());
        r.setDemandeur(dem);
        r.setStatut(StatutReclamation.OUVERT);
        r.setDateCreation(LocalDateTime.now());
        r.setDateUpdate(LocalDateTime.now());

        // Image base64 : accepte data URL ("data:image/...;base64,...") ou base64 pur
        if (req.photoBase64() != null && !req.photoBase64().isBlank()) {
            try {
                String webPath = saveBase64ImageAndReturnWebPath(req.photoBase64());
                if (webPath != null) {
                    r.setPhotoPath(webPath); // ex: "/uploads/IMG_xxx.jpg"
                }
            } catch (IOException e) {
                // Si tu préfères bloquer en cas d’échec image, remplace par un throw
                System.err.println("Erreur enregistrement photo : " + e.getMessage());
            }
        }

        return recRepo.save(r);
    }

    public List<Reclamation> historyDemandeur(String demandeurUsername) {
        User dem = userRepo.findByUsername(demandeurUsername)
                .orElseThrow(() -> new IllegalArgumentException("Demandeur introuvable"));
        return recRepo.findByDemandeurOrderByDateCreationDesc(dem);
    }

    public Reclamation detailForDemandeur(String demandeurUsername, Long id) {
        Reclamation r = recRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation introuvable"));
        if (!r.getDemandeur().getUsername().equals(demandeurUsername))
            throw new IllegalArgumentException("Accès refusé");
        return r;
    }

    /* ============================
       TECHNICIEN
       ============================ */
    /** Toutes les réclamations du service du technicien connecté */
    public List<Reclamation> listForTechnician(String techUsername) {
        User tech = userRepo.findByUsername(techUsername)
                .orElseThrow(() -> new IllegalArgumentException("Technicien introuvable"));
        if (tech.getRole() != Role.TECHNICIEN)
            throw new IllegalArgumentException("Utilisateur non TECHNICIEN");

        return recRepo.findByServiceOrderByDateCreationDesc(tech.getService());
    }

    /** Détail d’une réclamation (vérifie qu’elle est bien du service du technicien) */
    public Reclamation detailForTechnician(String techUsername, Long id) {
        User tech = userRepo.findByUsername(techUsername)
                .orElseThrow(() -> new IllegalArgumentException("Technicien introuvable"));
        Reclamation r = recRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation introuvable"));
        if (r.getService() != tech.getService())
            throw new IllegalArgumentException("Hors de votre service");
        return r;
    }

    /** Uniquement les réclamations auxquelles CE technicien a déjà répondu */
    public List<Reclamation> repliedByTechnician(String techUsername) {
        User tech = userRepo.findByUsername(techUsername)
                .orElseThrow(() -> new IllegalArgumentException("Technicien introuvable"));
        if (tech.getRole() != Role.TECHNICIEN)
            throw new IllegalArgumentException("Utilisateur non TECHNICIEN");

        return recRepo.findByTechnicienOrderByDateUpdateDesc(tech);
    }

    /** Répondre (commentaire + statut) à une réclamation de son service */
    public Reclamation reply(String techUsername, Long id, TechReplyRequest body) {
        User tech = userRepo.findByUsername(techUsername)
                .orElseThrow(() -> new IllegalArgumentException("Technicien introuvable"));
        Reclamation r = recRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation introuvable"));
        if (tech.getRole() != Role.TECHNICIEN || r.getService() != tech.getService())
            throw new IllegalArgumentException("Hors de votre service");

        r.setTechnicien(tech);
        r.setReponseTechnicien(body.commentaire());
        r.setStatut(body.statut());
        r.setDateUpdate(LocalDateTime.now());
        if (body.statut() == StatutReclamation.RESOLUE || body.statut() == StatutReclamation.NON_RESOLUE) {
            r.setDateResolution(LocalDateTime.now());
        }
        return recRepo.save(r);
    }

    /* ============================
       ADMIN (stats)
       ============================ */
    public Map<String, Object> stats() {
        Map<String, Object> out = new LinkedHashMap<>();

        Map<String, Long> parService = new LinkedHashMap<>();
        parService.put("IT", recRepo.countByService(ServiceType.IT));
        parService.put("EQUIPEMENT", recRepo.countByService(ServiceType.EQUIPEMENT));
        parService.put("INFRASTRUCTURE", recRepo.countByService(ServiceType.INFRASTRUCTURE));
        out.put("parService", parService);

        Map<String, Long> parStatut = new LinkedHashMap<>();
        parStatut.put("OUVERT", recRepo.countByStatut(StatutReclamation.OUVERT));
        parStatut.put("EN_COURS", recRepo.countByStatut(StatutReclamation.EN_COURS));
        parStatut.put("RESOLUE", recRepo.countByStatut(StatutReclamation.RESOLUE));
        parStatut.put("NON_RESOLUE", recRepo.countByStatut(StatutReclamation.NON_RESOLUE));
        out.put("parStatut", parStatut);

        Double avgSec = recRepo.avgResolutionSeconds();
        out.put("dureeMoyenneResolutionMinutes", avgSec == null ? null : Math.round(avgSec / 60.0));
        return out;
    }

    /* ============================
       Helpers
       ============================ */

    /**
     * Sauvegarde une image envoyée en base64 (data URL ou base64 pur) dans ./uploads/
     * et renvoie le chemin web à exposer via Spring : "/uploads/IMG_xxx.ext"
     */
    private String saveBase64ImageAndReturnWebPath(String base64OrDataUrl) throws IOException {
        String header = null;
        String body = base64OrDataUrl;

        int commaIdx = base64OrDataUrl.indexOf(',');
        if (base64OrDataUrl.startsWith("data:") && commaIdx > 0) {
            header = base64OrDataUrl.substring(0, commaIdx);
            body = base64OrDataUrl.substring(commaIdx + 1);
        }

        String ext = detectExtensionFromHeader(header);
        if (ext == null) ext = "jpg";

        byte[] bytes = Base64.getDecoder().decode(body);

        Path dir = Paths.get("uploads");
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String filename = "IMG_" + UUID.randomUUID() + "." + ext;
        Path file = dir.resolve(filename);

        Files.write(file, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        // IMPORTANT: retourner un chemin WEB (relatif serveur) et non un chemin système
        return "/uploads/" + filename;
    }

    private String detectExtensionFromHeader(String header) {
        if (header == null) return null;
        String h = header.toLowerCase();
        if (h.contains("image/png")) return "png";
        if (h.contains("image/webp")) return "webp";
        if (h.contains("image/jpg")) return "jpg";
        if (h.contains("image/jpeg")) return "jpg";
        return null;
    }
}
