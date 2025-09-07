// src/main/java/com/airportangad/airportangad/repo/ReclamationRepository.java
package com.airportangad.airportangad.repo;

import com.airportangad.airportangad.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    List<Reclamation> findByDemandeurOrderByDateCreationDesc(User demandeur);

    List<Reclamation> findByServiceOrderByDateCreationDesc(ServiceType service);

    long countByService(ServiceType service);

    long countByStatut(StatutReclamation statut);

    // ✅ réclamations répondues par un technicien donné (tri par dernière MAJ)
    List<Reclamation> findByTechnicienOrderByDateUpdateDesc(User technicien);

    // ✅ durée moyenne de résolution en secondes (H2)
    @Query(value = """
            select avg(DATEDIFF('SECOND', r.date_creation, r.date_resolution))
            from reclamation r
            where r.date_resolution is not null
            """, nativeQuery = true)
    Double avgResolutionSeconds();

    // ✅ Recherche paginée pour l'admin (filtres optionnels + mot-clé sur titre/description)
    @Query("""
        SELECT r FROM Reclamation r
        WHERE (:statut IS NULL OR r.statut = :statut)
          AND (:service IS NULL OR r.service = :service)
          AND (
                :q IS NULL
             OR LOWER(r.titre) LIKE LOWER(CONCAT('%', :q, '%'))
             OR LOWER(r.description) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        """)
    Page<Reclamation> searchAdmin(StatutReclamation statut,
                                  ServiceType service,
                                  String q,
                                  Pageable pageable);
}
