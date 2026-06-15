import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { sqlite } from "../../../config/db.js";
import { DemoUser } from "../types/index.js";

const countries = [
  { isoCode: "NG", name: "Nigeria" },
  { isoCode: "GH", name: "Ghana" },
  { isoCode: "KE", name: "Kenya" },
  { isoCode: "ZA", name: "South Africa" },
  { isoCode: "EG", name: "Egypt" },
];

const statesData: Record<string, Array<{ isoCode: string; name: string }>> = {
  NG: [
    { isoCode: "LA", name: "Lagos" },
    { isoCode: "FC", name: "Abuja Federal Capital Territory" },
    { isoCode: "RV", name: "Rivers" },
    { isoCode: "OY", name: "Oyo" },
    { isoCode: "KN", name: "Kano" },
    { isoCode: "EN", name: "Enugu" },
    { isoCode: "KD", name: "Kaduna" },
    { isoCode: "DT", name: "Delta" },
    { isoCode: "ED", name: "Edo" },
    { isoCode: "OG", name: "Ogun" },
  ],
  GH: [
    { isoCode: "AA", name: "Greater Accra" },
    { isoCode: "AH", name: "Ashanti" },
  ],
  KE: [
    { isoCode: "NB", name: "Nairobi" },
    { isoCode: "MS", name: "Mombasa" },
  ],
  ZA: [
    { isoCode: "GT", name: "Gauteng" },
    { isoCode: "WC", name: "Western Cape" },
  ],
  EG: [
    { isoCode: "C", name: "Cairo" },
    { isoCode: "ALX", name: "Alexandria" },
  ],
};

const citiesData: Record<string, Record<string, Array<{ name: string }>>> = {
  NG: {
    LA: [{ name: "Ikeja" }, { name: "Lekki" }, { name: "Victoria Island" }, { name: "Surulere" }, { name: "Yaba" }],
    FC: [{ name: "Garki" }, { name: "Wuse" }, { name: "Maitama" }, { name: "Asokoro" }, { name: "Gwarinpa" }],
    RV: [{ name: "Port Harcourt" }, { name: "Obio-Akpor" }, { name: "Eleme" }, { name: "Oyigbo" }],
    OY: [{ name: "Ibadan" }, { name: "Oyo" }, { name: "Ogbomosho" }, { name: "Iseyin" }],
    KN: [{ name: "Kano Municipal" }, { name: "Fagge" }, { name: "Dala" }, { name: "Gwale" }],
    EN: [{ name: "Enugu Urban" }, { name: "Nsukka" }, { name: "Awgu" }],
    KD: [{ name: "Kaduna North" }, { name: "Kaduna South" }, { name: "Zaria" }],
    DT: [{ name: "Warri" }, { name: "Asaba" }, { name: "Sapele" }],
    ED: [{ name: "Benin City" }, { name: "Auchi" }, { name: "Ekpoma" }],
    OG: [{ name: "Abeokuta" }, { name: "Ijebu Ode" }, { name: "Sagamu" }],
  },
  GH: {
    AA: [{ name: "Accra" }, { name: "Tema" }],
    AH: [{ name: "Kumasi" }, { name: "Obuasi" }],
  },
  KE: {
    NB: [{ name: "Nairobi City" }, { name: "Kiambu" }],
    MS: [{ name: "Mombasa City" }, { name: "Kilifi" }],
  },
  ZA: {
    GT: [{ name: "Johannesburg" }, { name: "Pretoria" }],
    WC: [{ name: "Cape Town" }, { name: "Stellenbosch" }],
  },
  EG: {
    C: [{ name: "Cairo City" }, { name: "Giza" }],
    ALX: [{ name: "Alexandria City" }, { name: "Borg El Arab" }],
  },
};

const ratesData = [
  { rateId: "1", currency: "NGN", amount: 4500, carrier_name: "ShipPlug Express", carrier_rate_description: "Standard delivery (3\u20135 business days)", pickup_date: "2025-01-25T00:00:00.000Z", pickup_time: "09:00 AM \u2013 05:00 PM", delivery_date: "2025-01-30T00:00:00.000Z", delivery_time: "09:00 AM \u2013 02:00 PM" },
  { rateId: "2", currency: "NGN", amount: 7500, carrier_name: "ShipPlug Express", carrier_rate_description: "Express delivery (1\u20132 business days)", pickup_date: "2025-01-25T00:00:00.000Z", pickup_time: "09:00 AM \u2013 05:00 PM", delivery_date: "2025-01-26T00:00:00.000Z", delivery_time: "09:00 AM \u2013 02:00 PM" },
  { rateId: "3", currency: "NGN", amount: 2500, carrier_name: "ShipPlug Economy", carrier_rate_description: "Economy delivery (5\u20137 business days)", pickup_date: "2025-01-25T00:00:00.000Z", pickup_time: "09:00 AM \u2013 05:00 PM", delivery_date: "2025-02-01T00:00:00.000Z", delivery_time: "09:00 AM \u2013 02:00 PM" },
];

const purposeOptions = ["Personal Effects", "Business", "Gift", "Commercial Goods", "Documents"];

export const LogisticsClientController = () => {

  /* ---------- Auth ---------- */

  const Login = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ msg: "Validation failed" });

      const user = sqlite
        .prepare("SELECT id, name, email, phone FROM logistics_client_users WHERE email = ? AND password = ?")
        .get(req.body.email, req.body.password) as DemoUser | undefined;

      if (!user) return res.status(400).json({ msg: "Invalid login details" });

      return res.json({
        msg: "Login successful",
        user: { _id: user.id.toString(), firstName: "Demo", lastName: "User", email: user.email },
        token: "demo-logistics-client-token",
        expiresIn: "2026-12-31T23:59:59.000Z",
      });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const Register = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ msg: "Validation failed" });

      return res.json({ msg: "Registration successful" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  /* ---------- Shipment ---------- */

  const GetShipments = async (req: Request, res: Response) => {
    try {
      const id = req.query._id as string | undefined;
      if (id) {
        const row = sqlite.prepare("SELECT data FROM logistics_client_shipping WHERE id = ? AND data IS NOT NULL").get(parseInt(id)) as { data: string } | undefined;
        return res.json({ all: row ? [JSON.parse(row.data)] : [] });
      }
      const rows = sqlite.prepare("SELECT data FROM logistics_client_shipping WHERE data IS NOT NULL ORDER BY id").all() as { data: string }[];
      return res.json({ all: rows.map((r) => JSON.parse(r.data)) });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const GetShipmentPurposeOptions = async (_req: Request, res: Response) => {
    try {
      return res.json({ all: purposeOptions });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const CreateShipment = async (req: Request, res: Response) => {
    try {
      const { addressFromId, addressToId, addressReturnId, parcel, shipmentPurpose, metadata } = req.body;
      const now = new Date().toISOString();
      const result = sqlite.prepare(
        "INSERT INTO logistics_client_shipping (tracking_number, user_id, origin, destination, weight, packaging_id, status, data) VALUES (?, 1, '', '', 0, 1, 'pending', '')",
      ).run("SPL-" + Date.now());
      const id = String(result.lastInsertRowid);
      const newShipment = {
        _id: id,
        userId: "1",
        shipmentPurpose: shipmentPurpose || "",
        parcel: parcel || "",
        metadata: metadata || { message: "" },
        addressToId: addressToId || "",
        addressFromId: addressFromId || "",
        addressReturnId: addressReturnId || "",
        status: "pending",
        shipmentId: id,
        events: [],
        createdAt: now,
        updatedAt: now,
      };
      sqlite.prepare("UPDATE logistics_client_shipping SET data = ? WHERE id = ?").run(JSON.stringify(newShipment), id);
      return res.json({ msg: "Shipment created successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const ArrangePickup = async (req: Request, res: Response) => {
    try {
      const { rateId, shipmentId } = req.body;
      return res.json({ msg: "Pickup arranged successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  /* ---------- Rates ---------- */

  const GetRates = async (_req: Request, res: Response) => {
    try {
      return res.json({
        result: {
          message: "Rates retrieved successfully",
          data: ratesData,
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  /* ---------- Packaging ---------- */

  const GetPackaging = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT data FROM logistics_client_packaging WHERE data IS NOT NULL ORDER BY id").all() as { data: string }[];
      return res.json({ all: rows.map((r) => JSON.parse(r.data)) });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const CreatePackaging = async (req: Request, res: Response) => {
    try {
      const { height, length, name, type, weight, width } = req.body;
      const now = new Date().toISOString();
      const result = sqlite.prepare(
        "INSERT INTO logistics_client_packaging (name, description, dimensions, price, data) VALUES (?, '', '', 0, '')",
      ).run(name || "");
      const id = String(result.lastInsertRowid);
      const newPackaging = {
        _id: id,
        userId: "1",
        name: name || "",
        type: type || "",
        height: String(height || ""),
        length: String(length || ""),
        width: String(width || ""),
        weight: String(weight || ""),
        sizeUnit: "cm",
        weightUnit: "kg",
        packagingId: id,
        createdAt: now,
        updatedAt: now,
      };
      sqlite.prepare("UPDATE logistics_client_packaging SET data = ? WHERE id = ?").run(JSON.stringify(newPackaging), id);
      return res.json({ msg: "Package created successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const GetPackagingTypes = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT data FROM logistics_client_packaging WHERE data IS NOT NULL ORDER BY id").all() as { data: string }[];
      const types = [...new Set(rows.map((r) => JSON.parse(r.data).type))];
      return res.json({ all: types });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const UpdatePackaging = async (req: Request, res: Response) => {
    try {
      const existing = sqlite.prepare("SELECT id, data FROM logistics_client_packaging WHERE id = ?").get(parseInt(String(req.params.id))) as { id: number; data: string } | undefined;
      if (!existing || !existing.data) return res.status(404).json({ msg: "Package not found" });

      const parsed = JSON.parse(existing.data);
      const { height, length, name, type, weight, width } = req.body;
      if (name !== undefined) parsed.name = name;
      if (type !== undefined) parsed.type = type;
      if (height !== undefined) parsed.height = String(height);
      if (length !== undefined) parsed.length = String(length);
      if (width !== undefined) parsed.width = String(width);
      if (weight !== undefined) parsed.weight = String(weight);
      parsed.updatedAt = new Date().toISOString();
      sqlite.prepare("UPDATE logistics_client_packaging SET data = ? WHERE id = ?").run(JSON.stringify(parsed), existing.id);
      return res.json({ msg: "Package updated successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  /* ---------- Parcel ---------- */

  const GetParcels = async (req: Request, res: Response) => {
    try {
      const packagingDocId = req.query.packagingDocId as string | undefined;
      const rows = sqlite.prepare("SELECT data FROM logistics_client_parcels ORDER BY id").all() as { data: string }[];
      const all = rows.map((r) => JSON.parse(r.data));
      if (packagingDocId) {
        return res.json({ all: all.filter((p) => p.packagingDocId === packagingDocId) });
      }
      return res.json({ all });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const CreateParcel = async (req: Request, res: Response) => {
    try {
      const { description, items, packagingDocId, metadata } = req.body;
      const now = new Date().toISOString();
      const result = sqlite.prepare(
        "INSERT INTO logistics_client_parcels (user_id, data) VALUES (1, '')",
      ).run();
      const id = String(result.lastInsertRowid);
      const newParcel = {
        _id: id,
        userId: "1",
        description: description || "",
        metadata: metadata || { message: "" },
        items: items || [],
        parcelId: id,
        weightUnit: "kg",
        packagingDocId: packagingDocId || "",
        createdAt: now,
        updatedAt: now,
      };
      sqlite.prepare("UPDATE logistics_client_parcels SET data = ? WHERE id = ?").run(JSON.stringify(newParcel), id);
      return res.json({ msg: "Parcel created successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const UpdateParcel = async (req: Request, res: Response) => {
    try {
      const existing = sqlite.prepare("SELECT id, data FROM logistics_client_parcels WHERE id = ?").get(parseInt(String(req.params.id))) as { id: number; data: string } | undefined;
      if (!existing) return res.status(404).json({ msg: "Parcel not found" });

      const parsed = JSON.parse(existing.data);
      const { description, items, packagingDocId, metadata } = req.body;
      if (description !== undefined) parsed.description = description;
      if (items !== undefined) parsed.items = items;
      if (packagingDocId !== undefined) parsed.packagingDocId = packagingDocId;
      if (metadata !== undefined) parsed.metadata = metadata;
      parsed.updatedAt = new Date().toISOString();
      sqlite.prepare("UPDATE logistics_client_parcels SET data = ? WHERE id = ?").run(JSON.stringify(parsed), existing.id);
      return res.json({ msg: "Parcel updated successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  /* ---------- Address ---------- */

  const GetAddress = async (req: Request, res: Response) => {
    try {
      const packagingDocId = req.query.packagingDocId as string | undefined;
      const rows = sqlite.prepare("SELECT data FROM logistics_client_addresses WHERE data IS NOT NULL ORDER BY id").all() as { data: string }[];
      const all = rows.map((r) => JSON.parse(r.data));
      if (packagingDocId) {
        return res.json({ all: all.filter((a) => a.packagingDocId === packagingDocId) });
      }
      return res.json({ all });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const CreateAddress = async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, phone, line1, country, state, city, isResidential, metadata, zip, name, packagingDocId } = req.body;
      const now = new Date().toISOString();
      const result = sqlite.prepare(
        "INSERT INTO logistics_client_addresses (user_id, label, street, city, state, country, phone, is_default, data) VALUES (1, '', '', '', '', '', '', 0, '')",
      ).run();
      const id = String(result.lastInsertRowid);
      const newAddress = {
        _id: id,
        userId: "1",
        packagingDocId: packagingDocId || "",
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        phone: phone || "",
        line1: line1 || "",
        line2: "",
        country: country || "",
        state: state || "",
        city: city || "",
        isResidential: isResidential === true || isResidential === "true",
        metadata: metadata || { message: "" },
        zip: zip || "",
        name: name || "",
        addressId: id,
        createdAt: now,
        updatedAt: now,
      };
      sqlite.prepare("UPDATE logistics_client_addresses SET data = ? WHERE id = ?").run(JSON.stringify(newAddress), id);
      return res.json({ msg: "Address created successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const UpdateAddress = async (req: Request, res: Response) => {
    try {
      const existing = sqlite.prepare("SELECT id, data FROM logistics_client_addresses WHERE id = ?").get(parseInt(String(req.params.id))) as { id: number; data: string } | undefined;
      if (!existing || !existing.data) return res.status(404).json({ msg: "Address not found" });

      const parsed = JSON.parse(existing.data);
      const { firstName, lastName, email, phone, line1, country, state, city, isResidential, metadata, zip, name, packagingDocId } = req.body;
      if (firstName !== undefined) parsed.firstName = firstName;
      if (lastName !== undefined) parsed.lastName = lastName;
      if (email !== undefined) parsed.email = email;
      if (phone !== undefined) parsed.phone = phone;
      if (line1 !== undefined) parsed.line1 = line1;
      if (country !== undefined) parsed.country = country;
      if (state !== undefined) parsed.state = state;
      if (city !== undefined) parsed.city = city;
      if (isResidential !== undefined) parsed.isResidential = isResidential === true || isResidential === "true";
      if (metadata !== undefined) parsed.metadata = metadata;
      if (zip !== undefined) parsed.zip = zip;
      if (name !== undefined) parsed.name = name;
      if (packagingDocId !== undefined) parsed.packagingDocId = packagingDocId;
      parsed.updatedAt = new Date().toISOString();
      sqlite.prepare("UPDATE logistics_client_addresses SET data = ? WHERE id = ?").run(JSON.stringify(parsed), existing.id);
      return res.json({ msg: "Address updated successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const GetCountries = async (_req: Request, res: Response) => {
    try {
      return res.json({ all: countries });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const GetStates = async (req: Request, res: Response) => {
    try {
      const countryCode = String(req.params.countryCode);
      const result = statesData[countryCode] || [];
      return res.json({ all: result });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  const GetCities = async (req: Request, res: Response) => {
    try {
      const countryCode = String(req.params.countryCode);
      const stateCode = String(req.params.stateCode);
      const result = citiesData[countryCode]?.[stateCode] || [];
      return res.json({ all: result });
    } catch (error) {
      return res.status(500).json({ msg: "Unexpected error" });
    }
  };

  return {
    Login,
    Register,
    GetShipments,
    GetShipmentPurposeOptions,
    CreateShipment,
    ArrangePickup,
    GetRates,
    GetPackaging,
    CreatePackaging,
    GetPackagingTypes,
    UpdatePackaging,
    GetParcels,
    CreateParcel,
    UpdateParcel,
    GetAddress,
    CreateAddress,
    UpdateAddress,
    GetCountries,
    GetStates,
    GetCities,
  };
};
