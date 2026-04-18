class REALM {
    constructor(id, name, stage, stat_cap,energy_cap, req_energy, requirement,multiplier) {
        this.id = id
        this.name = name
        this.stage = stage // "Entry", "Proficient", "Peak", or null for low ranks
        this.stat_cap = stat_cap
        this.req_energy = req_energy
        this.energy_cap=energy_cap
        this.multiplier = multiplier // Increases Qi gains
        this.requirement= requirement||(()=>{return true})
    }
    
    requirement(){

    }

}
const realm_db = [
    new REALM(0,"Mortal",null,10,10,0,()=>true,0),
    // --- Low Realms ---
    new REALM(1, "Third Rate", null, 30, 100, 0,()=> true, 1.0),
    new REALM(2, "Second Rate", null, 60, 250, 150, ()=> true, 1.2),
    new REALM(3, "First Rate", null, 100, 500, 400, () => true, 1.5),

    // --- Master Realms (Expert Prowess) ---
    new REALM(4, "Master", "Entry", 150, 1000, 800, () => true, 2.0),
    new REALM(4, "Master", "Proficient", 200, 1500, 1200, () => true, 2.2),
    new REALM(4, "Master", "Peak", 250, 2500, 2000, () => true, 2.5),

    // --- Grandmaster Realms (Top Masters) ---
    new REALM(5, "Grandmaster", "Entry", 350, 5000, 4000, () => true, 3.0),
    new REALM(5, "Grandmaster", "Proficient", 450, 7500, 6000, () => true, 3.5),
    new REALM(5, "Grandmaster", "Peak", 550, 10000, 9000, () => true, 4.0),

    // --- Superior Master (Unrestrained Realm) ---
    new REALM(6, "Superior Master", "Entry", 700, 20000, 15000, () => true, 5.0),
    new REALM(6, "Superior Master", "Proficient", 850, 30000, 25000, () => true, 5.5),
    new REALM(6, "Superior Master", "Peak", 1000, 50000, 40000, () => true, 6.0),

    // --- Supreme Master (Profound Realm) ---
    new REALM(7, "Supreme Master", "Entry", 1500, 100000, 70000, () => true, 8.0),
    new REALM(7, "Supreme Master", "Proficient", 2000, 150000, 120000, () => true, 10.0),
    new REALM(7, "Supreme Master", "Peak", 3000, 250000, 200000, () => true, 12.0),

    // --- Apex Realms ---
    new REALM(8, "Divine Master", null, 5000, 600000, 500000, () => true, 20.0),
    new REALM(9, "Heavenly Master", null, 10000, 1200000, 1000000, () => true, 50.0),
    new REALM(10, "Void Master", null, 50000, 6000000, 5000000, () => true, 100.0),
    new REALM(11, "Willful Master", null, Infinity, Infinity, Infinity, () => true, 999.0)
]