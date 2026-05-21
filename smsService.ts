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

// Mode simulation activé si pas d'hôte configuré
const isSimulationMode = !SMPP_HOST;

if (isSimulationMode) {
  console.log('📢 Service SMS : Mode simulation activé (aucune variable SMPP_HOST trouvée dans le fichier .env).');
} else {
  console.log(`🔌 Connexion au serveur SMPP : smpp://${SMPP_HOST}:${SMPP_PORT}...`);
  try {
    smppSession = smpp.connect({
      url: `smpp://${SMPP_HOST}:${SMPP_PORT}`
    });

    smppSession.on('connect', () => {
      console.log('🟢 Session SMPP établie. Envoi du Bind transmitter...');
      smppSession.bind_transmitter({
        system_id: SMPP_SYSTEM_ID,
        password: SMPP_PASSWORD,
        system_type: SMPP_SYSTEM_TYPE || ''
      }, (pdu: any) => {
        if (pdu.command_status === 0) {
          isConnected = true;
          console.log('✅ Authentification SMPP réussie et liée (Bound Transmitter).');
        } else {
          console.error(`❌ Échec de l'authentification SMPP (Bind Status: ${pdu.command_status}).`);
        }
      });
    });

    smppSession.on('error', (err: any) => {
      console.error('❌ Erreur de connexion SMPP :', err.message);
      isConnected = false;
    });

    smppSession.on('close', () => {
      console.log('🔌 Connexion SMPP fermée.');
      isConnected = false;
    });
  } catch (error: any) {
    console.error('❌ Échec de l\'initialisation de la session SMPP :', error.message);
  }
}

/**
 * Envoie un message SMS via SMPP ou simule l'envoi
 * @param destination Numéro de téléphone de destination (ex: +22177xxxxxxx)
 * @param text Contenu du SMS
 * @returns Promise avec statut d'envoi ('Distribué' | 'Échoué')
 */
export function sendSMS(destination: string, text: string): Promise<'Distribué' | 'Échoué'> {
  return new Promise((resolve) => {
    // Nettoyage du numéro de téléphone
    const phone = destination.trim();

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

    // Options submit_sm
    const options = {
      destination_addr: phone,
      short_message: text,
      source_addr: SMPP_SENDER_ID || 'DaaraSunu',
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
