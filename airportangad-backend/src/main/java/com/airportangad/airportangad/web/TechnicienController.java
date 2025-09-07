package com.airportangad.airportangad.web;

import com.airportangad.airportangad.domain.Reclamation;
import com.airportangad.airportangad.service.ReclamationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicien/reclamations")
public class TechnicienController {

    private final ReclamationService svc;

    public TechnicienController(ReclamationService svc) {
        this.svc = svc;
    }

    /** Liste de toutes les réclamations du service du technicien */
    @GetMapping
    public List<Reclamation> list(@RequestParam String username) {
        return svc.listForTechnician(username);
    }

    /** Liste des réclamations auxquelles le technicien a déjà répondu */
    @GetMapping("/replied")
    public List<Reclamation> replied(@RequestParam String username) {
        return svc.repliedByTechnician(username);
    }

    /** Détail d’une réclamation (contrôle du service) */
    @GetMapping("/{id}")
    public Reclamation detail(@RequestParam String username, @PathVariable Long id) {
        return svc.detailForTechnician(username, id);
    }

    /** Réponse du technicien (commentaire + statut) */
    @PostMapping("/{id}/reponse")
    public Reclamation reply(@RequestParam String username,
                             @PathVariable Long id,
                             @RequestBody ReclamationService.TechReplyRequest body) {
        return svc.reply(username, id, body);
    }
}
