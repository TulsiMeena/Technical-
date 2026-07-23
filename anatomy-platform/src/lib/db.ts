import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'data/anatomy.db');

// Ensure the directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

// Initialize schema and seed data if it doesn't exist
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      scientificName TEXT NOT NULL,
      description TEXT NOT NULL,
      function TEXT NOT NULL,
      system TEXT NOT NULL,
      color TEXT NOT NULL,
      positionX REAL,
      positionY REAL,
      positionZ REAL
    );

    CREATE TABLE IF NOT EXISTS diseases (
      id TEXT PRIMARY KEY,
      organId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      FOREIGN KEY (organId) REFERENCES organs (id)
    );
  `);

  // Check if seeded
  const count = db.prepare('SELECT COUNT(*) as count FROM organs').get() as { count: number };
  if (count.count === 0) {
    const insertOrgan = db.prepare(`
      INSERT INTO organs (id, name, scientificName, description, function, system, color, positionX, positionY, positionZ)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertDisease = db.prepare(`
      INSERT INTO diseases (id, organId, name, description, symptoms)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Sample Data
    const organs = [
      {
        id: 'brain', name: 'Brain', scientificName: 'Encephalon',
        description: 'The central organ of the human nervous system.',
        function: 'Controls thought, memory, emotion, touch, motor skills, vision, breathing, and every process that regulates our body.',
        system: 'Nervous', color: '#ffb6c1', posX: 0, posY: 1.5, posZ: 0
      },
      {
        id: 'heart', name: 'Heart', scientificName: 'Cor',
        description: 'A muscular organ about the size of a fist, located just behind and slightly left of the breastbone.',
        function: 'Pumps blood through the network of arteries and veins called the cardiovascular system.',
        system: 'Cardiovascular', color: '#ff4d4d', posX: 0.1, posY: 0.5, posZ: 0.2
      },
      {
        id: 'lungs', name: 'Lungs', scientificName: 'Pulmones',
        description: 'A pair of spongy, air-filled organs located on either side of the chest (thorax).',
        function: 'Respiration (breathing). Oxygen enters the blood and carbon dioxide leaves.',
        system: 'Respiratory', color: '#add8e6', posX: 0, posY: 0.6, posZ: 0
      },
      {
        id: 'liver', name: 'Liver', scientificName: 'Hepar',
        description: 'The largest solid organ in the body, situated in the upper right part of the abdomen.',
        function: 'Filters all of the blood in the body and breaks down poisonous substances, such as alcohol and drugs.',
        system: 'Digestive', color: '#8b4513', posX: -0.2, posY: 0.1, posZ: 0.1
      }
    ];

    db.transaction(() => {
      organs.forEach(o => {
        insertOrgan.run(o.id, o.name, o.scientificName, o.description, o.function, o.system, o.color, o.posX, o.posY, o.posZ);
      });

      insertDisease.run('d1', 'brain', "Alzheimer's Disease", 'A progressive disease that destroys memory.', 'Memory loss, confusion.');
      insertDisease.run('d2', 'heart', 'Coronary Artery Disease', 'Narrowing or blockage of the coronary arteries.', 'Chest pain, shortness of breath.');
      insertDisease.run('d3', 'lungs', 'Asthma', 'A condition in which airways narrow and swell.', 'Wheezing, coughing.');
    })();
  }
};

initDb();

export default db;
