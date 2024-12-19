-- Création de la base de données
CREATE DATABASE site_web;

-- Utilisation de la base de données
USE site_web;

-- Création de la table utilisateurs
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,            -- Identifiant unique
    nom_utilisateur VARCHAR(50) NOT NULL,         -- Nom d'utilisateur
    email VARCHAR(100) NOT NULL UNIQUE,           -- Adresse e-mail unique
    mot_de_passe VARCHAR(255) NOT NULL,           -- Mot de passe (haché)
    role ENUM('admin', 'utilisateur') NOT NULL,   -- Rôle de l'utilisateur
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Date de création
);

-- Insertion d'un compte administrateur
INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe, role)
VALUES (
    'admin',
    'admin@exemple.com',
    SHA2('mot_de_passe_admin', 256), -- Remplacez par un mot de passe sécurisé
    'admin'
);

-- Vérification des utilisateurs
SELECT * FROM utilisateurs;
