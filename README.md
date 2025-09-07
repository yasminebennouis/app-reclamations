# app-reclamations
# 📱 Application Mobile de Gestion des Réclamations

Cette application permet de gérer les réclamations dans un aéroport avec trois types d’utilisateurs : **Admin**, **Demandeur**, et **Technicien**.  
Elle est composée d’un **backend** (Spring Boot + H2) et d’un **frontend mobile** (React Native avec Expo).

---

## 🔧 Prérequis

Avant de lancer l’application, assurez-vous d’avoir installé :

- **Java 17+**  
- **Maven**  
- **Node.js (LTS recommandé)**  
- **npm** ou **yarn**  
- (Optionnel) **Expo Go** sur un smartphone Android/iOS pour tester l’app mobile  

---

## 🚀 Lancer le Backend (Spring Boot)

1. Ouvrir un terminal et se placer dans le dossier `AIRPORTANGAD/`  
2. Lancer la commande :
   ```bash
   mvn spring-boot:run

    Le backend démarre sur :
    👉 http://localhost:8888

✅ Le backend utilise H2 Database en mémoire, donc aucune configuration de base de données n’est nécessaire.
📱 Lancer le Frontend (React Native avec Expo)

    Ouvrir un autre terminal et se placer dans le dossier airportangad-front/

    Installer les dépendances :

npm install

Lancer l’application :

    npx expo start

    Expo ouvrira une interface dans le navigateur avec un QR Code :

        Scanner le QR Code avec l’application Expo Go (Android/iOS)

        Ou utiliser un émulateur Android/iOS sur l’ordinateur

🔗 Connexion Front ↔ Backend

    Le frontend est configuré pour communiquer avec le backend via :

    http://localhost:8888

    Assurez-vous que le backend est lancé avant d’ouvrir l’application mobile.

👤 Comptes de test (déjà présents dans H2)

    Admin

        Username : admin

        Password : 1234

    Demandeur

        Username : demandeur

        Password : 1234

    Technicien IT

        Username : tech_it

        Password : 1234

    Technicien Équipement

        Username : tech_equip

        Password : 1234

📂 Structure du projet

app-reclamations/
├── AIRPORTANGAD/         # Backend (Spring Boot, REST API, H2 DB)
├── airportangad-front/   # Frontend (React Native avec Expo)
└── README.md             # Guide d’installation et d’utilisation

⚡ Fonctionnalités principales

    Demandeur

        Créer une réclamation (avec photo)

        Consulter ses réclamations et leur statut

    Technicien

        Voir les réclamations liées à son service

        Répondre et mettre à jour le statut d’une réclamation

    Admin

        Accéder à toutes les réclamations (pagination, recherche, filtres)

        Consulter les statistiques globales par service et statut
