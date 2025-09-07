package com.airportangad.airportangad.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Reclamation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ServiceType service;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "text")
    private String description;

    private String photoPath;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private StatutReclamation statut = StatutReclamation.OUVERT;

    @ManyToOne(optional = false)
    private User demandeur;

    @ManyToOne
    private User technicien;

    @Column(columnDefinition = "text")
    private String reponseTechnicien;

    private LocalDateTime dateCreation = LocalDateTime.now();
    private LocalDateTime dateUpdate;
    private LocalDateTime dateResolution;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ServiceType getService() { return service; }
    public void setService(ServiceType service) { this.service = service; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }
    public StatutReclamation getStatut() { return statut; }
    public void setStatut(StatutReclamation statut) { this.statut = statut; }
    public User getDemandeur() { return demandeur; }
    public void setDemandeur(User demandeur) { this.demandeur = demandeur; }
    public User getTechnicien() { return technicien; }
    public void setTechnicien(User technicien) { this.technicien = technicien; }
    public String getReponseTechnicien() { return reponseTechnicien; }
    public void setReponseTechnicien(String reponseTechnicien) { this.reponseTechnicien = reponseTechnicien; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public LocalDateTime getDateUpdate() { return dateUpdate; }
    public void setDateUpdate(LocalDateTime dateUpdate) { this.dateUpdate = dateUpdate; }
    public LocalDateTime getDateResolution() { return dateResolution; }
    public void setDateResolution(LocalDateTime dateResolution) { this.dateResolution = dateResolution; }
}
