import * as React from 'react';
import { 
  Send, 
  MessageSquare, 
  History, 
  Plus, 
  Search, 
  Users, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  X,
  FileText,
  Variable,
  Layout,
  MessageCircle,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { MessageTemplate, CommunicationLog } from '@/src/types';
import { useApp } from '../context/AppContext';

export function Communications() {
  const { templates, logs, eleves, refreshData } = useApp();
  const [activeTab, setActiveTab] = React.useState<'send' | 'history'>('send');
  const [isCampaignModalOpen, setIsCampaignModalOpen] = React.useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<MessageTemplate | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [targetFilter, setTargetFilter] = React.useState<'all' | 'sponsors' | 'internal' | 'custom' | 'manual' | 'csv'>('all');

  const [messageText, setMessageText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [canal, setCanal] = React.useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');

  // Nouveaux états pour le ciblage dynamique
  const [customSelectedIds, setCustomSelectedIds] = React.useState<Set<number>>(new Set());
  const [studentSearchQuery, setStudentSearchQuery] = React.useState('');
  const [manualRecipientName, setManualRecipientName] = React.useState('');
  const [manualRecipientPhone, setManualRecipientPhone] = React.useState('');
  const [csvRecipients, setCsvRecipients] = React.useState<Array<{ nom: string; telephone: string }>>([]);
  const [csvError, setCsvError] = React.useState('');
  const [csvSuccess, setCsvSuccess] = React.useState('');

  // Nouveaux modèles
  const [newTemplateTitle, setNewTemplateTitle] = React.useState('');
  const [newTemplateCanal, setNewTemplateCanal] = React.useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');
  const [newTemplateContenu, setNewTemplateContenu] = React.useState('');

  const getTargets = () => {
    if (targetFilter === 'manual') {
      const phones = manualRecipientPhone
        .split(/[\n,]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      return phones.map(phone => {
        let msg = messageText;
        msg = msg.replace(/\[Nom_Parent\]/g, manualRecipientName || 'Parent');
        msg = msg.replace(/\[Nom_Parrain\]/g, manualRecipientName || 'Parrain');
        msg = msg.replace(/\[Nom_Donateur\]/g, manualRecipientName || 'Donateur');
        msg = msg.replace(/\[Nom_Eleve\]/g, 'Élève');
        msg = msg.replace(/\[Hizb\]/g, '0');
        msg = msg.replace(/\[Mois\]/g, new Date().toLocaleString('fr-FR', { month: 'long' }));
        msg = msg.replace(/\[Montant\]/g, '0');
        msg = msg.replace(/\[Diagnostic\]/g, 'consultation médicale');

        return {
          parent_nom: manualRecipientName || 'Destinataire Manuel',
          telephone: phone,
          message: msg
        };
      });
    }

    if (targetFilter === 'csv') {
      return csvRecipients.map(r => {
        let msg = messageText;
        msg = msg.replace(/\[Nom_Parent\]/g, r.nom || 'Parent');
        msg = msg.replace(/\[Nom_Parrain\]/g, r.nom || 'Parrain');
        msg = msg.replace(/\[Nom_Donateur\]/g, r.nom || 'Donateur');
        msg = msg.replace(/\[Nom_Eleve\]/g, 'Élève');
        msg = msg.replace(/\[Hizb\]/g, '0');
        msg = msg.replace(/\[Mois\]/g, new Date().toLocaleString('fr-FR', { month: 'long' }));
        msg = msg.replace(/\[Montant\]/g, '0');
        msg = msg.replace(/\[Diagnostic\]/g, 'consultation médicale');

        return {
          parent_nom: r.nom || 'Contact CSV',
          telephone: r.telephone,
          message: msg
        };
      });
    }

    let targetsEleves = eleves;
    if (targetFilter === 'sponsors') {
      targetsEleves = eleves.filter(e => e.statut_prise_en_charge === 'Parrainé');
    } else if (targetFilter === 'internal') {
      targetsEleves = eleves.filter(e => e.statut_pension === 'Interne');
    } else if (targetFilter === 'custom') {
      targetsEleves = eleves.filter(e => customSelectedIds.has(e.id));
    }

    return targetsEleves.map(eleve => {
      let msg = messageText;
      msg = msg.replace(/\[Nom_Parent\]/g, eleve.tuteur_nom || 'Parent');
      msg = msg.replace(/\[Nom_Parrain\]/g, eleve.tuteur_nom || 'Parrain');
      msg = msg.replace(/\[Nom_Donateur\]/g, eleve.tuteur_nom || 'Donateur');
      msg = msg.replace(/\[Nom_Eleve\]/g, `${eleve.prenom} ${eleve.nom}`);
      msg = msg.replace(/\[Hizb\]/g, String(eleve.niveau_hizb));
      msg = msg.replace(/\[Mois\]/g, new Date().toLocaleString('fr-FR', { month: 'long' }));
      msg = msg.replace(/\[Montant\]/g, '0');
      msg = msg.replace(/\[Diagnostic\]/g, 'consultation médicale');

      return {
        parent_nom: eleve.tuteur_nom || `${eleve.prenom} ${eleve.nom}`,
        telephone: eleve.contact_parent,
        message: msg
      };
    }).filter(t => t.telephone);
  };

  const handleSendCampaign = async () => {
    if (!messageText) return;
    setIsSending(true);
    
    const targets = getTargets();
    if (targets.length === 0) {
      alert('Aucun destinataire valide à cibler.');
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets })
      });
      if (res.ok) {
        await refreshData();
        setIsCampaignModalOpen(false);
        setMessageText('');
        setSelectedTemplate(null);
        setCustomSelectedIds(new Set());
        setManualRecipientName('');
        setManualRecipientPhone('');
        setCsvRecipients([]);
        setCsvSuccess('');
        setCsvError('');
        alert(`Campagne envoyée avec succès à ${targets.length} destinataires !`);
      } else {
        alert('Erreur lors de l\'envoi de la campagne.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau lors de l\'envoi de la campagne.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredStudents = eleves.filter(e => 
    `${e.prenom} ${e.nom}`.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (e.tuteur_nom || '').toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    (e.matricule || '').toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const toggleSelectStudent = (id: number) => {
    const next = new Set(customSelectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCustomSelectedIds(next);
  };

  const selectAllStudents = () => {
    setCustomSelectedIds(new Set(eleves.map(e => e.id)));
  };

  const deselectAllStudents = () => {
    setCustomSelectedIds(new Set());
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError('');
    setCsvSuccess('');
    setCsvRecipients([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setCsvError('Le fichier est vide.');
          return;
        }

        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) {
          setCsvError('Aucune ligne trouvée dans le fichier.');
          return;
        }

        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';

        const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
        
        let nameIdx = -1;
        let phoneIdx = -1;

        const nameKeywords = ['nom', 'name', 'tuteur', 'parent', 'destinataire', 'contact'];
        const phoneKeywords = ['tel', 'phone', 'téléphone', 'telephone', 'mobile', 'numero', 'numéro'];

        headers.forEach((h, idx) => {
          if (nameKeywords.some(keyword => h.includes(keyword))) {
            nameIdx = idx;
          }
          if (phoneKeywords.some(keyword => h.includes(keyword))) {
            phoneIdx = idx;
          }
        });

        let startLine = 1;
        if (nameIdx === -1 || phoneIdx === -1) {
          nameIdx = 0;
          phoneIdx = 1;
          const looksLikeData = /\d+/.test(firstLine);
          if (looksLikeData) {
            startLine = 0;
          }
        }

        const parsed: Array<{ nom: string; telephone: string }> = [];

        for (let i = startLine; i < lines.length; i++) {
          const cols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
          const nom = cols[nameIdx] || `Contact ${i}`;
          const telephone = cols[phoneIdx] || '';

          if (telephone) {
            parsed.push({ nom, telephone });
          }
        }

        if (parsed.length === 0) {
          setCsvError('Aucun contact avec un numéro de téléphone valide n\'a été détecté.');
        } else {
          setCsvRecipients(parsed);
          setCsvSuccess(`${parsed.length} contacts chargés avec succès.`);
        }
      } catch (err: any) {
        setCsvError(`Erreur lors de la lecture du fichier : ${err.message}`);
      }
    };

    reader.onerror = () => {
      setCsvError('Erreur de lecture du fichier.');
    };

    reader.readAsText(file);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateTitle || !newTemplateContenu) return;
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: newTemplateTitle,
          canal: newTemplateCanal,
          contenu: newTemplateContenu
        })
      });
      if (res.ok) {
        await refreshData();
        setIsTemplateModalOpen(false);
        setNewTemplateTitle('');
        setNewTemplateContenu('');
        setNewTemplateCanal('SMS');
      } else {
        alert('Erreur lors de la création du modèle.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau lors de la création du modèle.');
    }
  };

  const sponsorsCount = eleves.filter(e => e.statut_prise_en_charge === 'Parrainé').length;
  
  const filteredLogs = logs.filter(log => 
    log.parent_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.telephone.includes(searchQuery)
  );

  const StatusIcon = ({ status }: { status: string }) => {
    switch(status) {
      case 'Distribué': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'Envoyé': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Échoué': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getTargetCount = () => {
    return getTargets().length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Communications</h1>
          <p className="text-gray-500 text-sm">Gérez les échanges avec les parents et les campagnes de messages.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Layout className="w-4 h-4" />
            <span>Nouveau Modèle</span>
          </button>
          <button 
            onClick={() => {
              setSelectedTemplate(null);
              setMessageText('');
              setCanal('SMS');
              setIsCampaignModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Envoi en Masse</span>
          </button>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-4 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('send')}
          className={cn(
            "pb-4 text-sm font-bold transition-all px-2 relative",
            activeTab === 'send' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Campagnes & Envois
          {activeTab === 'send' && <motion.div layoutId="comm-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "pb-4 text-sm font-bold transition-all px-2 relative",
            activeTab === 'history' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Historique & Modèles
          {activeTab === 'history' && <motion.div layoutId="comm-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'send' ? (
          <motion.div 
            key="send-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Quick Templates Grid */}
            <div className="lg:col-span-2 space-y-4 text-black">
              <h2 className="text-lg font-bold text-gray-800">Modèles Rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ y: -2 }}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setMessageText(template.contenu);
                      setCanal(template.canal);
                      setIsCampaignModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        template.canal === 'SMS' ? "bg-amber-50 text-amber-600" :
                        template.canal === 'WhatsApp' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {template.canal === 'SMS' ? <Smartphone className="w-4 h-4" /> :
                         template.canal === 'WhatsApp' ? <MessageCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase tracking-wider">{template.canal}</span>
                    </div>
                    <h3 className="font-bold text-gray-800">{template.titre}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 italic leading-relaxed text-black">
                      {template.contenu.split(/(\[.*?\])/).map((part, i) => 
                        part.startsWith('[') && part.endsWith(']') ? 
                          <span key={i} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{part}</span> : part
                      )}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-blue-600 font-bold uppercase">Utiliser ce modèle</span>
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions / Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-600/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold">Ciblage Automatique</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl">
                    <span className="text-sm">Élèves payants</span>
                    <span className="font-bold bg-white text-blue-600 px-2 py-0.5 rounded-lg text-xs">{sponsorsCount}</span>
                  </div>
                   <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl">
                    <span className="text-sm">Élèves non payants</span>
                    <span className="font-bold bg-white text-blue-600 px-2 py-0.5 rounded-lg text-xs">{eleves.length - sponsorsCount}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setTargetFilter('sponsors');
                    const parrainsTemplate = templates.find(t => t.titre.includes('Parrains') || t.titre.includes('parrain'));
                    if (parrainsTemplate) {
                      setSelectedTemplate(parrainsTemplate);
                      setMessageText(parrainsTemplate.contenu);
                      setCanal(parrainsTemplate.canal);
                    } else {
                      setSelectedTemplate(null);
                      setMessageText('');
                      setCanal('SMS');
                    }
                    setIsCampaignModalOpen(true);
                  }}
                  className="w-full mt-6 bg-white text-blue-600 py-3 rounded-xl font-extrabold text-sm hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Contacter les élèves payants
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-black">
                 <h3 className="font-bold text-gray-800 mb-4">Raccourcis Variables</h3>
                 <div className="space-y-2">
                    {[
                      { key: '[Nom_Parent]', desc: 'Nom complet du tuteur' },
                      { key: '[Nom_Eleve]', desc: 'Prénom et Nom de l\'élève' },
                      { key: '[Mois]', desc: 'Mois de facturation' },
                      { key: '[Montant]', desc: 'Solde restant dû' }
                    ].map(v => (
                      <div key={v.key} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        <Variable className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs font-mono font-bold text-blue-600">{v.key}</p>
                          <p className="text-[10px] text-gray-400">{v.desc}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Templates Management */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-black">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-600" />
                  Gestionnaire de Modèles
                </h2>
                <button 
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Modèle
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group relative">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{template.canal}</span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-white rounded-md text-gray-400 hover:text-blue-600"><FileText className="w-3.5 h-3.5"/></button>
                          <button className="p-1 hover:bg-white rounded-md text-gray-400 hover:text-red-600"><X className="w-3.5 h-3.5"/></button>
                       </div>
                    </div>
                    <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-2">{template.titre}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{template.contenu}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-black">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Journal des Envois
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Nom parent ou numéro..."
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64 text-black"
                    />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 border border-gray-200">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto text-black">
                <table className="w-full text-left italic">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest italic">
                    <tr>
                      <th className="px-6 py-4">Destinataire</th>
                      <th className="px-6 py-4">Date & Heure</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors group italic">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 italic">{log.parent_nom}</p>
                          <p className="text-[10px] text-gray-400 italic">{log.telephone}</p>
                        </td>
                        <td className="px-6 py-4 italic">
                          <p className="text-xs text-gray-600 font-medium italic">{new Date(log.date_envoi).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-400 italic">{new Date(log.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-6 py-4 max-w-xs italic">
                          <p className="text-xs text-gray-500 truncate italic">{log.message}</p>
                        </td>
                        <td className="px-6 py-4 italic">
                          <div className="flex items-center gap-2 italic">
                            <StatusIcon status={log.statut} />
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              log.statut === 'Distribué' ? "text-green-600" : 
                              log.statut === 'Envoyé' ? "text-blue-600" : "text-red-600"
                            )}>
                              {log.statut}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right italic">
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Modal (Sent Bulk) */}
      <AnimatePresence>
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 italic">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCampaignModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Send className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Nouvelle Campagne Massif</h2>
                </div>
                <button onClick={() => setIsCampaignModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 text-black italic">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 italic">
                  <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Canal de communication</label>
                    <div className="grid grid-cols-3 gap-2 italic">
                       {['SMS', 'WhatsApp', 'Email'].map(c => (
                         <button 
                           key={c} 
                           type="button"
                           onClick={() => setCanal(c as any)}
                           className={cn(
                             "py-2 rounded-xl text-xs font-bold border transition-all italic",
                             canal === c ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-gray-50 border-gray-200 text-gray-500"
                           )}
                         >
                            {c}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Cible des destinataires</label>
                    <select 
                      value={targetFilter} 
                      onChange={(e) => setTargetFilter(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 italic text-black font-medium"
                    >
                      <option value="all">Tous les parents ({eleves.length})</option>
                      <option value="sponsors">Élèves payants uniquement ({sponsorsCount})</option>
                      <option value="internal">Internat uniquement ({eleves.filter(e => e.statut_pension === 'Interne').length})</option>
                      <option value="custom">Sélection personnalisée (liste)</option>
                      <option value="manual">Saisie manuelle de numéros</option>
                      <option value="csv">Importer un fichier CSV</option>
                    </select>
                  </div>
                </div>

                {/* Options de cibles conditionnelles */}
                {targetFilter === 'custom' && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 space-y-4 text-black">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Sélectionnez les élèves ({customSelectedIds.size} sélectionné(s))</span>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={selectAllStudents}
                          className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                          Tout cocher
                        </button>
                        <button 
                          type="button" 
                          onClick={deselectAllStudents}
                          className="text-[10px] bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                        >
                          Tout décocher
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Rechercher un élève ou tuteur..." 
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none text-black"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-200/50 rounded-xl bg-white p-2 space-y-1">
                      {filteredStudents.map(eleve => {
                        const isChecked = customSelectedIds.has(eleve.id);
                        return (
                          <label 
                            key={eleve.id} 
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleSelectStudent(eleve.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <img 
                              src={eleve.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${eleve.prenom}`}
                              alt={eleve.prenom} 
                              className="w-8 h-8 rounded-full border border-gray-100 shrink-0" 
                            />
                            <div className="text-left">
                              <p className="text-xs font-bold text-gray-800">{eleve.prenom} {eleve.nom}</p>
                              <p className="text-[10px] text-gray-400">Parent: {eleve.tuteur_nom || 'N/A'} ({eleve.contact_parent})</p>
                            </div>
                          </label>
                        );
                      })}
                      {filteredStudents.length === 0 && (
                        <p className="text-xs text-gray-400 py-4 text-center">Aucun élève trouvé.</p>
                      )}
                    </div>
                  </div>
                )}

                {targetFilter === 'manual' && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 space-y-3 text-black">
                    <span className="text-xs font-bold text-gray-500 uppercase block">Saisie Manuelle</span>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nom du contact (optionnel)</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Tuteur externe"
                          value={manualRecipientName}
                          onChange={(e) => setManualRecipientName(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Numéro(s) de téléphone (séparés par une virgule ou saut de ligne)</label>
                        <textarea 
                          rows={3}
                          placeholder="Ex: +221771234567, +221789876543"
                          value={manualRecipientPhone}
                          onChange={(e) => setManualRecipientPhone(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-black font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {targetFilter === 'csv' && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 space-y-3 text-black">
                    <span className="text-xs font-bold text-gray-500 uppercase block">Importer un fichier CSV</span>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      Le fichier CSV doit contenir des colonnes avec les entêtes <strong>Nom</strong> et <strong>Telephone</strong> (ou simplement deux colonnes: Nom en premier, Téléphone en second).
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Plus className="w-6 h-6 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500 font-bold">Cliquez pour charger le fichier .csv</p>
                          </div>
                          <input 
                            type="file" 
                            accept=".csv" 
                            className="hidden" 
                            onChange={handleCSVUpload} 
                          />
                        </label>
                      </div>

                      {csvError && (
                        <div className="flex items-center bg-red-50 border border-red-100 p-3 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <p className="text-[10px] text-red-700 ml-2 font-medium">{csvError}</p>
                        </div>
                      )}

                      {csvSuccess && (
                        <div className="flex items-center bg-green-50 border border-green-100 p-3 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                          <p className="text-[10px] text-green-700 ml-2 font-bold">{csvSuccess}</p>
                        </div>
                      )}

                      {csvRecipients.length > 0 && (
                        <div className="border border-gray-200/50 rounded-xl overflow-hidden bg-white">
                          <p className="bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase">Aperçu des contacts</p>
                          <div className="divide-y divide-gray-100 p-2 space-y-1 max-h-32 overflow-y-auto">
                            {csvRecipients.map((r, idx) => (
                              <div key={idx} className="flex justify-between text-left text-xs p-1.5">
                                <span className="font-bold text-gray-800">{r.nom}</span>
                                <span className="font-mono text-gray-500">{r.telephone}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 italic">
                  <label className="text-xs font-bold text-gray-400 uppercase italic">Modèle de message</label>
                  <select 
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const t = templates.find(temp => temp.id === Number(e.target.value));
                      setSelectedTemplate(t || null);
                      setMessageText(t ? t.contenu : '');
                      if (t) setCanal(t.canal);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 italic"
                  >
                    <option value="">Texte Libre (Sans modèle)</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.titre}</option>)}
                  </select>
                </div>

                <div className="space-y-4 italic">
                  <label className="text-xs font-bold text-gray-400 uppercase italic">Contenu du message</label>
                  <div className="relative italic">
                    <div className="absolute inset-0 p-6 pointer-events-none text-sm leading-relaxed whitespace-pre-wrap break-words opacity-0">
                      {messageText}
                    </div>
                    <textarea 
                      rows={6}
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                      }}
                      placeholder="Composez votre message ici..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm leading-relaxed italic z-10 relative bg-transparent"
                    />
                    <div className="absolute top-2 right-2 flex gap-1 italic z-20">
                      <button className="p-1.5 bg-white border border-gray-100 rounded-lg text-blue-600 hover:bg-gray-50 transition-colors shadow-sm italic">
                        <Variable className="w-4 h-4 italic" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Dynamic Preview Rendering */}
                  <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-inner">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Layout className="w-3 h-3" />
                       Aperçu du rendu final
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed font-mono">
                       {messageText.split(/(\[.*?\])/).map((part, i) => (
                         part.startsWith('[') && part.endsWith(']') ? 
                           <span key={i} className="text-blue-400 font-bold bg-blue-900/50 px-1 rounded border border-blue-500/30">{part}</span> 
                           : part
                       ))}
                    </p>
                  </div>

                  <div className="flex bg-blue-50 border border-blue-100 p-4 rounded-2xl italic">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 italic" />
                    <p className="text-[11px] text-blue-700 italic ml-3">
                      Les variables dynamiques comme <span className="font-bold underline italic">[Nom_Parent]</span> seront automatiquement remplacées pour chacun des <span className="font-bold italic">{getTargetCount()} destinataires</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50 italic">
                <button 
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-white transition-colors italic"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSendCampaign}
                  disabled={isSending || !messageText}
                  className={cn(
                    "bg-blue-600 text-white px-8 py-2 rounded-xl text-sm font-extrabold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 italic flex items-center gap-2",
                    (isSending || !messageText) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin mr-1" />
                  ) : (
                    <Send className="w-4 h-4 italic" />
                  )}
                  Lancer l'Envoi ({getTargetCount()})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Studio Modal (Placeholder) */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 italic">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 italic"
            >
              <h2 className="text-xl font-bold mb-6 text-black italic">Créer un Nouveau Modèle</h2>
              <div className="space-y-4 text-black italic">
                 <div className="space-y-2 italic">
                   <label className="text-xs font-bold text-gray-400 italic uppercase">Titre du Modèle</label>
                   <input 
                     type="text" 
                     value={newTemplateTitle}
                     onChange={(e) => setNewTemplateTitle(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 italic outfit text-black outline-none focus:ring-2 focus:ring-blue-500/20" 
                     placeholder="Ex: Avis de retard" 
                   />
                 </div>
                 <div className="space-y-2 italic text-black">
                   <label className="text-xs font-bold text-gray-400 italic uppercase">Canal Défaut</label>
                   <select 
                     value={newTemplateCanal}
                     onChange={(e) => setNewTemplateCanal(e.target.value as any)}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 italic text-black outline-none focus:ring-2 focus:ring-blue-500/20"
                   >
                      <option value="SMS">SMS</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                   </select>
                 </div>
                 <div className="space-y-2 italic">
                   <label className="text-xs font-bold text-gray-400 italic uppercase">Structure du message</label>
                   <textarea 
                     rows={4} 
                     value={newTemplateContenu}
                     onChange={(e) => setNewTemplateContenu(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 italic text-black outfit outline-none focus:ring-2 focus:ring-blue-500/20" 
                     placeholder="Utilisez les [] pour les variables..." 
                   />
                 </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 italic">
                 <button onClick={() => setIsTemplateModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors italic">Fermer</button>
                 <button 
                   onClick={handleCreateTemplate}
                   disabled={!newTemplateTitle || !newTemplateContenu}
                   className={cn(
                     "px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/10 italic",
                     (!newTemplateTitle || !newTemplateContenu) && "opacity-50 cursor-not-allowed"
                   )}
                 >
                   Enregistrer
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
