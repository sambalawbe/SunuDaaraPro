import dotenv from 'dotenv';
// @ts-ignore
import smpp from 'smpp';

dotenv.config();

const {
  SMPP_HOST,
  SMPP_PORT,
  SMPP_SYSTEM_ID,
  SMPP_PASSWORD,
  SMPP_SYSTEM_TYPE,
  SMPP_SENDER_ID
} = process.env;

let smppSession: any = null;
let isConnected = false;
let reconnectTimeout: any = null;

// Mode simulation activé si pas d'hôte configuré
const isSimulationMode = !SMPP_HOST;

function connectSMPP() {
  if (isSimulationMode) {
    console.log('📢 Service SMS : Mode simulation activé (aucune variable SMPP_HOST trouvée dans le fichier .env).');
    return;
  }

  console.log(`🔌 Connexion au serveur SMPP : smpp://${SMPP_HOST}:${SMPP_PORT}...`);
  try {
    if (smppSession) {
      try {
        smppSession.close();
      } catch (e) {}
    }

    smppSession = smpp.connect({
      url: `smpp://${SMPP_HOST}:${SMPP_PORT}`,
      auto_enquire_link_period: 30000 // Keep-alive toutes les 30 secondes
    });

    smppSession.on('connect', () => {
      console.log('🟢 Session SMPP établie. Envoi du Bind transceiver...');
      smppSession.bind_transceiver({
        system_id: SMPP_SYSTEM_ID,
        password: SMPP_PASSWORD,
        system_type: SMPP_SYSTEM_TYPE || ''
      }, (pdu: any) => {
        if (pdu.command_status === 0) {
          isConnected = true;
          console.log('✅ Authentification SMPP réussie et liée (Bound Transceiver).');
        } else {
          console.error(`❌ Échec de l'authentification SMPP (Bind Status: ${pdu.command_status}).`);
          isConnected = false;
          scheduleReconnect();
        }
      });
    });

    smppSession.on('error', (err: any) => {
      console.error('❌ Erreur de connexion SMPP :', err.message);
      isConnected = false;
      scheduleReconnect();
    });

    smppSession.on('close', () => {
      console.log('🔌 Connexion SMPP fermée.');
      isConnected = false;
      scheduleReconnect();
    });
  } catch (error: any) {
    console.error('❌ Échec de l\'initialisation de la session SMPP :', error.message);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimeout) return;
  console.log('🔄 Planification d\'une tentative de reconnexion SMPP dans 10 secondes...');
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connectSMPP();
  }, 10000);
}

// Initialiser la connexion au chargement
connectSMPP();

/**
 * Envoie un message SMS via SMPP ou simule l'envoi
 * @param destination Numéro de téléphone de destination (ex: +22177xxxxxxx)
 * @param text Contenu du SMS
 * @returns Promise avec statut d'envoi ('Distribué' | 'Échoué')
 */
export function sendSMS(destination: string, text: string): Promise<'Distribué' | 'Échoué'> {
  return new Promise((resolve) => {
    // Normalisation du numéro de téléphone
    // 1. Enlever tout caractère non numérique (sauf + au cas où)
    let phone = destination.replace(/[^\d+]/g, '');
    
    // 2. Retirer le + de tête
    if (phone.startsWith('+')) {
      phone = phone.substring(1);
    }
    // 3. Retirer les 00 initiaux
    if (phone.startsWith('00')) {
      phone = phone.substring(2);
    }
    // 4. Si c'est un numéro local sénégalais de 9 chiffres (ex: 77xxxxxxx, 78xxxxxxx, etc.), on préfixe par 221
    if (phone.length === 9 && /^(77|78|76|70|75|33)/.test(phone)) {
      phone = '221' + phone;
    }

    if (isSimulationMode) {
      console.log(`[SIMULATION SMS] Envoi de SMS à ${phone} : "${text}"`);
      // Simulation d'un délai réseau
      setTimeout(() => {
        resolve('Distribué');
      }, 500);
      return;
    }

    if (!isConnected || !smppSession) {
      console.error('❌ Impossible d\'envoyer le SMS : session SMPP non disponible.');
      resolve('Échoué');
      return;
    }

    // Configuration dynamique du TON/NPI de l'émetteur
    const sender = SMPP_SENDER_ID || 'DaaraSunu';
    const isAlphanumeric = /[a-zA-Z]/.test(sender);
    const sourceTon = isAlphanumeric ? 5 : 1; // 5 = Alphanumeric, 1 = International
    const sourceNpi = isAlphanumeric ? 0 : 1; // 0 = Unknown/Default, 1 = ISDN/E.164

    // Options submit_sm
    const options = {
      source_addr_ton: sourceTon,
      source_addr_npi: sourceNpi,
      dest_addr_ton: 1, // International format
      dest_addr_npi: 1, // ISDN/E.164
      destination_addr: phone,
      short_message: text,
      source_addr: sender,
      registered_delivery: 1
    };

    console.log(`💬 Envoi SMPP de SMS vers ${phone}...`);
    smppSession.submit_sm(options, (pdu: any) => {
      if (pdu.command_status === 0) {
        console.log(`✅ SMS soumis avec succès. ID Message SMPP : ${pdu.message_id}`);
        resolve('Distribué');
      } else {
        console.error(`❌ Échec de la soumission du SMS SMPP (Status: ${pdu.command_status})`);
        resolve('Échoué');
      }
    });
  });
}
