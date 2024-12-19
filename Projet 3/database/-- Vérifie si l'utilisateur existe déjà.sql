-- Vérifie si l'utilisateur existe déjà
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM utilisateurs WHERE email = 'jean.dupont@example.com') 
        THEN 'Erreur : Cet utilisateur existe déjà' 
        ELSE 'Utilisateur ajouté avec succès'
    END AS resultat;

-- Si l'utilisateur n'existe pas, insérer les données
INSERT INTO utilisateurs (nom, prenom, email)
SELECT 'Dupont', 'Jean', 'jean.dupont@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM utilisateurs WHERE email = 'jean.dupont@example.com'
);
