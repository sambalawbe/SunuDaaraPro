# Guide d'implémentation SQLite Offline pour Sama Daara Pro

Ce guide détaille comment transformer ce prototype en une application Desktop 100% fonctionnelle avec stockage local.

## 1. Choix technologique : Electron + SQLite
Pour une application de bureau moderne, la combinaison d'Electron (Frontend React) et d'un backend Node.js avec `better-sqlite3` est la plus performante.

## 2. Structure du Backend (Main Process)

Dans votre fichier `server.ts` ou `main.js` (Electron), vous gérez la connexion :

```typescript
import Database from 'better-sqlite3';
import path from 'path';

// Localisation de la base de données (dans le dossier utilisateur)
const dbPath = path.join(process.cwd(), 'sama_daara.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialisation du schéma (voir schema.sql fourni)
const schema = `... contenu de schema.sql ...`;
db.exec(schema);

export default db;
```

## 3. Communication Frontend/Backend
Utilisez des fonctions asynchrones pour interroger la base de données :

```typescript
// Exemple de fonction de récupération des élèves
export function getElevesActifs() {
  const stmt = db.prepare('SELECT * FROM eleves WHERE statut = ?');
  return stmt.all('Actif');
}

// Exemple d'ajout d'élève
export function addEleve(eleve: Eleve) {
  const insert = db.prepare(`
    INSERT INTO eleves (matricule, nom, contact_parent, niveau_hizb)
    VALUES (?, ?, ?, ?)
  `);
  return insert.run(eleve.matricule, eleve.nom, eleve.contact_parent, eleve.niveau_hizb);
}
```

## 4. Gestion "Offline First"
Puisque SQLite est local, l'application est naturellement hors-ligne. 
- **Performance :** L'accès disque local est quasi-instantané (millisecondes).
- **Sécurité :** Vous pouvez chiffrer la base de données avec `sqlcipher` si nécessaire.
- **Sauvegarde :** Proposez un bouton "Exporter Sauvegarde" qui copie simplement le fichier `.db` vers un dossier externe ou le Cloud (Google Drive/Dropbox) pour la synchronisation.

## 5. Prochaines Étapes
1. **Implémentation des CRUD :** Créer les formulaires React pour chaque table SQL.
2. **Système SMS :** Utiliser une API comme Twilio ou une passerelle GSM locale pour envoyer les notifications mémorisées dans la base.
3. **Mise en page des Dortoirs :** Créer une grille visuelle représentant les lits, mappée sur la colonne `lit_numero` de la table `eleves`.
