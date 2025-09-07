package com.airportangad.airportangad.web;

import com.airportangad.airportangad.domain.User;
import com.airportangad.airportangad.repo.UserRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;

    public AuthController(UserRepository users) { this.users = users; }

    public record LoginReq(@NotBlank String username, @NotBlank String password) {}
    public record LoginRes(String username, String role, String service) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        User u = users.findByUsername(req.username()).orElse(null);
        if (u == null) return ResponseEntity.status(401).body("Utilisateur inexistant");
        if (!u.getPassword().equals(req.password()))
            return ResponseEntity.status(401).body("Mot de passe incorrect");

        return ResponseEntity.ok(new LoginRes(
                u.getUsername(), u.getRole().name(),
                u.getService() == null ? null : u.getService().name()
        ));
    }
}
