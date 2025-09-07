package com.airportangad.airportangad.web;

import com.airportangad.airportangad.domain.Reclamation;
import com.airportangad.airportangad.service.ReclamationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandeur/reclamations")
public class DemandeurController {

    private final ReclamationService svc;

    public DemandeurController(ReclamationService svc) { this.svc = svc; }

    @PostMapping
    public Reclamation create(@RequestParam String username,
                              @RequestBody ReclamationService.ReclamationRequest req) {
        return svc.create(username, req);
    }

    @GetMapping
    public List<Reclamation> history(@RequestParam String username) {
        return svc.historyDemandeur(username);
    }

    @GetMapping("/{id}")
    public Reclamation detail(@RequestParam String username, @PathVariable Long id) {
        return svc.detailForDemandeur(username, id);
    }
}
