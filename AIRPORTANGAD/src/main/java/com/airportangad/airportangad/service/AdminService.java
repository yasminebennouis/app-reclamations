// src/main/java/com/airportangad/airportangad/service/AdminService.java
package com.airportangad.airportangad.service;

import com.airportangad.airportangad.domain.Reclamation;
import com.airportangad.airportangad.domain.ServiceType;
import com.airportangad.airportangad.domain.StatutReclamation;
import com.airportangad.airportangad.repo.ReclamationRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminService {
    private final ReclamationRepository repo;

    public AdminService(ReclamationRepository repo) { this.repo = repo; }

    public Page<Reclamation> list(Integer page, Integer size, String sort,
                                  StatutReclamation statut, ServiceType service, String q) {
        int p = page == null || page < 0 ? 0 : page;
        int s = size == null || size <= 0 ? 20 : size;
        Sort sortSpec = Sort.by(StringUtils.hasText(sort) ? sort : "dateCreation").descending();
        Pageable pageable = PageRequest.of(p, s, sortSpec);
        String query = StringUtils.hasText(q) ? q.trim() : null;
        return repo.searchAdmin(statut, service, query, pageable);
    }

    public Reclamation detail(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation introuvable"));
    }
}
