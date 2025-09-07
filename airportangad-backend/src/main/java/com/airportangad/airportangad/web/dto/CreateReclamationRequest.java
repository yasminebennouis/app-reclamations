// src/main/java/com/airportangad/airportangad/web/dto/CreateReclamationRequest.java
package com.airportangad.airportangad.web.dto;

import com.airportangad.airportangad.domain.ServiceType;

public class CreateReclamationRequest {
    public ServiceType service;
    public String titre;
    public String description;

    // optionnels
    public String photoBase64; // "data:image/jpeg;base64,XXXXX" ou juste base64
    public String photoPath;   // si tu envoies un chemin direct (facultatif)
}
