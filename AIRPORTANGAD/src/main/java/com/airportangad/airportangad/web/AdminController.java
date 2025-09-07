// src/main/java/com/airportangad/airportangad/web/AdminController.java
package com.airportangad.airportangad.web;

import com.airportangad.airportangad.domain.Reclamation;
import com.airportangad.airportangad.domain.ServiceType;
import com.airportangad.airportangad.domain.StatutReclamation;
import com.airportangad.airportangad.service.AdminService;
import com.airportangad.airportangad.service.ReclamationService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;
    private final ReclamationService svc;

    public AdminController(AdminService admin, ReclamationService svc) {
        this.admin = admin;
        this.svc = svc;
    }

    /** Liste paginée + filtres + recherche (titre/description)
     *  Exemple:
     *  GET /api/admin/reclamations?page=0&size=20&sort=dateCreation&statut=EN_COURS&service=IT&q=reseau
     */
    @GetMapping("/reclamations")
    public Page<Reclamation> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort, // ex: dateCreation, dateUpdate
            @RequestParam(required = false) StatutReclamation statut,
            @RequestParam(required = false) ServiceType service,
            @RequestParam(required = false) String q
    ) {
        return admin.list(page, size, sort, statut, service, q);
    }

    /** Détail d’une réclamation (admin) */
    @GetMapping("/reclamations/{id}")
    public Reclamation detail(@PathVariable Long id) {
        try {
            return admin.detail(id);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /** Statistiques globales */
    @GetMapping("/stats")
    public Map<String, Object> stats() { return svc.stats(); }
}
