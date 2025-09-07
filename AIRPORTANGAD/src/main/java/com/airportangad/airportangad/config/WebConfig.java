// src/main/java/com/airportangad/airportangad/config/WebConfig.java
package com.airportangad.airportangad.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Expose les fichiers locaux sous /uploads/**
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    // CORS global : accepte localhost:*, 10.0.2.2, 192.168.x.x, exp://*, etc.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")           // <-- évite d’énumérer les ports (8081/8082/19006…)
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)              // si tu n'utilises pas de cookies/sessions
                .maxAge(3600);
    }
}
