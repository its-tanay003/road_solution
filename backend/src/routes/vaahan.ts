import { Router } from 'express';
const router = Router();

const STATE_CODES: Record<string, string> = {
  KA:'Karnataka', MH:'Maharashtra', DL:'Delhi', TN:'Tamil Nadu',
  UP:'Uttar Pradesh', RJ:'Rajasthan', GJ:'Gujarat', WB:'West Bengal',
  AP:'Andhra Pradesh', TS:'Telangana', PB:'Punjab', HR:'Haryana',
  MP:'Madhya Pradesh', OR:'Odisha', BR:'Bihar', KL:'Kerala',
};

const INSURANCE_PROVIDERS = ['New India Assurance', 'United India Insurance', 'National Insurance', 'Oriental Insurance', 'HDFC Ergo', 'Bajaj Allianz', 'ICICI Lombard', 'Reliance General'];
const VEHICLE_MAKES = ['MARUTI SUZUKI', 'HYUNDAI', 'TATA MOTORS', 'HONDA', 'TOYOTA', 'MAHINDRA', 'KIA', 'FORD'];
const VEHICLE_MODELS: Record<string, string[]> = {
  'MARUTI SUZUKI': ['SWIFT', 'SWIFT DZIRE', 'BALENO', 'BREZZA', 'ERTIGA'],
  'HYUNDAI': ['CRETA', 'VERNA', 'i20', 'VENUE', 'TUCSON'],
  'TATA MOTORS': ['NEXON', 'HARRIER', 'SAFARI', 'PUNCH', 'ALTROZ'],
};

router.get('/:regNumber', (req, res) => {
  const reg = req.params.regNumber.toUpperCase().replace(/[\s-]/g, '');
  if (!/^[A-Z]{2}\d{2}[A-Z]{0,3}\d{4}$/.test(reg)) {
    return res.status(400).json({ error: 'Invalid registration number format. Example: KA01MF1234' });
  }

  const stateCode = reg.substring(0, 2);
  const make = VEHICLE_MAKES[Math.floor(Math.random() * VEHICLE_MAKES.length)];
  const models = VEHICLE_MODELS[make] || ['UNKNOWN'];
  const model = models[Math.floor(Math.random() * models.length)];
  const year = 2015 + Math.floor(Math.random() * 10);
  const insProvider = INSURANCE_PROVIDERS[Math.floor(Math.random() * INSURANCE_PROVIDERS.length)];
  const insExpiry = new Date();
  insExpiry.setFullYear(insExpiry.getFullYear() + Math.floor(Math.random() * 2));
  const pucExpiry = new Date();
  pucExpiry.setMonth(pucExpiry.getMonth() + Math.floor(Math.random() * 6) + 1);

  res.json({
    registrationNumber: reg,
    ownerName: ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Mohammed Rafi'][Math.floor(Math.random()*5)],
    vehicleMake: make,
    vehicleModel: model,
    vehicleYear: year,
    fuelType: ['Petrol', 'Diesel', 'CNG', 'Electric'][Math.floor(Math.random() * 4)],
    vehicleCategory: 'LMV',
    engineCC: 1000 + Math.floor(Math.random() * 1500),
    seatingCapacity: 5,
    color: ['White', 'Silver', 'Grey', 'Blue', 'Red'][Math.floor(Math.random() * 5)],
    insuranceProvider: insProvider,
    insurancePolicyNumber: `${insProvider.substring(0,3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    insuranceValidity: insExpiry.toISOString().split('T')[0],
    insuranceValid: insExpiry > new Date(),
    pucValidity: pucExpiry.toISOString().split('T')[0],
    pucValid: pucExpiry > new Date(),
    fitnessValidity: new Date(Date.now() + 365*24*3600*1000*2).toISOString().split('T')[0],
    hypothecatedTo: Math.random() > 0.6 ? 'SBI BANK' : null,
    stateRTO: `${STATE_CODES[stateCode] || 'Unknown'} RTO`,
    blacklisted: false,
    source: 'Vaahan — MoRTH National Vehicle Registry (Simulated)',
    queriedAt: new Date().toISOString(),
  });
});

export default router;
