import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  Asset, 
  Location, 
  Responsible, 
  AssetMovement, 
  Maintenance, 
  Inventory, 
  DashboardStats,
  AssetCategory,
  AssetStatus
} from "./src/types";

const DB_PATH = path.join(process.cwd(), "patrimony_db.json");

// Default initial database seed
const INITIAL_DATABASE = {
  assets: [] as Asset[],
  locations: [] as Location[],
  responsibles: [] as Responsible[],
  movements: [] as AssetMovement[],
  maintenances: [] as Maintenance[],
  inventories: [] as Inventory[]
};

// Help load & save state
function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading JSON database, seeding instead.", err);
  }
  
  // Seed file
  saveDb(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database state", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API core logic
  // -------------------------------------------------------------

  // GET assets
  app.get("/api/assets", (req, res) => {
    const db = loadDb();
    res.json(db.assets);
  });

  // POST asset
  app.post("/api/assets", (req, res) => {
    const db = loadDb();
    const newAsset: Asset = {
      id: "ast-" + Date.now(),
      ...req.body
    };

    // Auto tag if empty
    if (!newAsset.tag) {
      const nextNum = db.assets.length + 1;
      newAsset.tag = `PAT-${nextNum.toString().padStart(4, "0")}`;
    }

    db.assets.push(newAsset);
    saveDb(db);
    res.status(201).json(newAsset);
  });

  // PUT asset
  app.put("/api/assets/:id", (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    const index = db.assets.findIndex((a: Asset) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Patrimônio não encontrado" });
    }

    db.assets[index] = { ...db.assets[index], ...req.body };
    saveDb(db);
    res.json(db.assets[index]);
  });

  // DELETE asset
  app.delete("/api/assets/:id", (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    
    // Check if asset exists
    const exists = db.assets.some((a: Asset) => a.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Patrimônio não encontrado" });
    }

    // Filter out asset
    db.assets = db.assets.filter((a: Asset) => a.id !== id);
    
    // Also cleanup active maintenances or movements associated for database hygiene
    db.maintenances = db.maintenances.filter((m: Maintenance) => m.assetId !== id);
    db.movements = db.movements.filter((m: AssetMovement) => m.assetId !== id);

    saveDb(db);
    res.json({ success: true, message: "Patrimônio removido com sucesso" });
  });

  // GET locations
  app.get("/api/locations", (req, res) => {
    const db = loadDb();
    res.json(db.locations);
  });

  // POST location
  app.post("/api/locations", (req, res) => {
    const db = loadDb();
    const newLoc: Location = {
      id: "loc-" + Date.now(),
      ...req.body
    };
    db.locations.push(newLoc);
    saveDb(db);
    res.status(201).json(newLoc);
  });

  // GET responsibles
  app.get("/api/responsibles", (req, res) => {
    const db = loadDb();
    res.json(db.responsibles);
  });

  // POST responsible
  app.post("/api/responsibles", (req, res) => {
    const db = loadDb();
    const newResp: Responsible = {
      id: "resp-" + Date.now(),
      ...req.body
    };
    db.responsibles.push(newResp);
    saveDb(db);
    res.status(201).json(newResp);
  });

  // GET movements
  app.get("/api/movements", (req, res) => {
    const db = loadDb();
    res.json(db.movements);
  });

  // POST movement (real movement of an asset)
  app.post("/api/movements", (req, res) => {
    const db = loadDb();
    const { assetId, toLocationId, toResponsibleId, reason } = req.body;

    const assetIndex = db.assets.findIndex((a: Asset) => a.id === assetId);
    if (assetIndex === -1) {
      return res.status(404).json({ error: "Patrimônio não encontrado" });
    }

    const asset = db.assets[assetIndex];
    const newMovement: AssetMovement = {
      id: "mov-" + Date.now(),
      assetId,
      fromLocationId: asset.locationId,
      toLocationId,
      fromResponsibleId: asset.responsibleId,
      toResponsibleId,
      date: new Date().toISOString().split('T')[0],
      reason: reason || "Transferência de Rotina"
    };

    // Update asset details
    asset.locationId = toLocationId;
    asset.responsibleId = toResponsibleId;
    
    db.movements.push(newMovement);
    saveDb(db);

    res.status(201).json({ asset, movement: newMovement });
  });

  // GET maintenances
  app.get("/api/maintenances", (req, res) => {
    const db = loadDb();
    res.json(db.maintenances);
  });

  // POST maintenance (Scheduler or trigger update)
  app.post("/api/maintenances", (req, res) => {
    const db = loadDb();
    const { assetId, description, provider, cost, startDate, status } = req.body;

    const newMaint: Maintenance = {
      id: "maint-" + Date.now(),
      assetId,
      description,
      provider,
      cost: Number(cost || 0),
      startDate: startDate || new Date().toISOString().split('T')[0],
      status: status || "pending"
    };

    // Update original asset's status to maintenance if the maintenance is active
    if (newMaint.status === "in_progress" || newMaint.status === "pending") {
      const assetIdx = db.assets.findIndex((a: Asset) => a.id === assetId);
      if (assetIdx !== -1) {
        db.assets[assetIdx].status = "maintenance";
      }
    }

    db.maintenances.push(newMaint);
    saveDb(db);
    res.status(201).json(newMaint);
  });

  // PUT maintenance (Finish or edit maint)
  app.put("/api/maintenances/:id", (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    const { status, endDate, cost } = req.body;

    const mIdx = db.maintenances.findIndex((m: Maintenance) => m.id === id);
    if (mIdx === -1) {
      return res.status(404).json({ error: "Registro de manutenção não encontrado" });
    }

    const mRecord = db.maintenances[mIdx];
    mRecord.status = status;
    if (endDate) mRecord.endDate = endDate;
    if (cost !== undefined) mRecord.cost = Number(cost);

    // If completed or canceled, return asset back to active
    if (status === "completed" || status === "canceled") {
      const assetIdx = db.assets.findIndex((a: Asset) => a.id === mRecord.assetId);
      if (assetIdx !== -1) {
        db.assets[assetIdx].status = "active";
      }
    }

    saveDb(db);
    res.json(mRecord);
  });

  // GET inventories
  app.get("/api/inventories", (req, res) => {
    const db = loadDb();
    res.json(db.inventories);
  });

  // POST inventory start
  app.post("/api/inventories/start", (req, res) => {
    const db = loadDb();
    const { title } = req.body;

    // Check if we already have an active inventory
    const activeInv = db.inventories.find((i: Inventory) => i.status === "active");
    if (activeInv) {
      return res.status(400).json({ error: "Já existe um inventário ativo em andamento." });
    }

    // Build lists of items dynamically from all current assets
    const items = db.assets.map((asset: Asset) => {
      const loc = db.locations.find((l: Location) => l.id === asset.locationId);
      return {
        assetId: asset.id,
        assetTag: asset.tag,
        assetName: asset.name,
        locationName: loc ? loc.name : "N/A",
        scanned: false
      };
    });

    const newInventory: Inventory = {
      id: "inv-" + Date.now(),
      title: title || "Novo Inventário Geral " + new Date().getFullYear(),
      startDate: new Date().toISOString().split('T')[0],
      status: "active",
      items
    };

    db.inventories.push(newInventory);
    saveDb(db);
    res.status(201).json(newInventory);
  });

  // POST inventory scan
  app.post("/api/inventories/scan", (req, res) => {
    const db = loadDb();
    const { tag, observations } = req.body;

    // Find active inventory
    const activeInvIdx = db.inventories.findIndex((i: Inventory) => i.status === "active");
    if (activeInvIdx === -1) {
      return res.status(404).json({ error: "Nenhum inventário ativo em andamento" });
    }

    const inventory = db.inventories[activeInvIdx];
    // Find item by tag
    const item = inventory.items.find((it: any) => it.assetTag.toUpperCase() === tag.trim().toUpperCase());
    if (!item) {
      return res.status(404).json({ error: `Ativo com a etiqueta ${tag} não está cadastrado neste inventário.` });
    }

    item.scanned = true;
    item.scanDate = new Date().toISOString();
    if (observations) {
      item.observations = observations;
    }

    saveDb(db);
    res.json({ message: "Ativo escaneado com sucesso!", inventory });
  });

  // POST inventory finish
  app.post("/api/inventories/finish", (req, res) => {
    const db = loadDb();
    const { inventoryId } = req.body;

    const index = db.inventories.findIndex((i: Inventory) => i.id === inventoryId);
    if (index === -1) {
      return res.status(404).json({ error: "Inventário não encontrado" });
    }

    db.inventories[index].status = "finished";
    db.inventories[index].endDate = new Date().toISOString().split('T')[0];

    saveDb(db);
    res.json(db.inventories[index]);
  });

  // GET dashboard
  app.get("/api/dashboard", (req, res) => {
    const db = loadDb();
    
    const assets = db.assets;
    const distributions_cat = { furniture: 0, it: 0, machinery: 0, vehicles: 0, electronics: 0, other: 0 };
    const distributions_status = { active: 0, maintenance: 0, transferred: 0, retired: 0 };

    let totalValue = 0;
    assets.forEach((a: Asset) => {
      distributions_cat[a.category] = (distributions_cat[a.category] || 0) + 1;
      distributions_status[a.status] = (distributions_status[a.status] || 0) + 1;
      totalValue += Number(a.value || 0);
    });

    const activeMaintenances = db.maintenances.filter((m: Maintenance) => m.status === "in_progress" || m.status === "pending").length;

    // Monthly acquisitions logic
    const monthlyAccsMap: Record<string, number> = {};
    assets.forEach((a: Asset) => {
      if (a.acquisitionDate) {
        // e.g. "2025-02-15" => "02/25" (or "Fev/25")
        try {
          const parts = a.acquisitionDate.split('-');
          if (parts.length >= 2) {
            const yearShort = parts[0].slice(2);
            const month = parts[1];
            const key = `${month}/${yearShort}`;
            monthlyAccsMap[key] = (monthlyAccsMap[key] || 0) + Number(a.value || 0);
          }
        } catch(e) {}
      }
    });

    // Make an array sorted
    const monthsNameMap: Record<string, string> = {
      "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
      "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez"
    };
    
    const monthlyAcquisitions = Object.entries(monthlyAccsMap).map(([key, val]) => {
      const parts = key.split('/');
      const mLabel = monthsNameMap[parts[0]] || parts[0];
      return {
        month: `${mLabel}/${parts[1]}`,
        value: val,
        raw_key: `${parts[1]}-${parts[0]}` // for sorting
      };
    }).sort((a, b) => a.raw_key.localeCompare(b.raw_key));

    const stats: DashboardStats = {
      totalAssets: assets.length,
      totalValue,
      maintenanceCount: activeMaintenances,
      pendingMovementsCount: db.movements.length,
      categoryDistribution: distributions_cat,
      statusDistribution: distributions_status,
      monthlyAcquisitions
    };

    res.json(stats);
  });

  // Serve static UI assets in production, otherwise Vite handles in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Masterop Patrimonial Server running on http://localhost:${PORT}`);
  });
}

startServer();
