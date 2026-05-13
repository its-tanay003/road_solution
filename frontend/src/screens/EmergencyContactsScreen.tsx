import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, MapPin, Plus, Trash2, Edit3, Star, ChevronRight, X } from 'lucide-react';
import { useUserStore, type EmergencyContact } from '../store/userStore';

/* ── colour by relation ─────────────────────────────────────── */
const RELATION_COLORS: Record<string, string> = {
  Mother: '#E91E63', Father: '#1565C0', Spouse: '#7B1FA2',
  Child: '#FF6F00', Sibling: '#00695C', Friend: '#2E7D32',
  Doctor: '#0277BD', Other: '#546E7A',
};
const RELATIONS = Object.keys(RELATION_COLORS);

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Avatar ─────────────────────────────────────────────────── */
function Avatar({ name, relation, size = 52 }: { name: string; relation: string; size?: number }) {
  const color = RELATION_COLORS[relation] || RELATION_COLORS.Other;
  return (
    <div className="rounded-full flex items-center justify-center font-black text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}>
      {initials(name)}
    </div>
  );
}

/* ── Contact Card ───────────────────────────────────────────── */
function ContactCard({ contact, isPrimary, onDelete }: {
  contact: EmergencyContact; isPrimary: boolean; onDelete: () => void;
}) {
  const [swiped, setSwiped] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* swipe-left actions */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        <button onClick={() => setSwiped(false)} className="px-4 bg-blue-600 flex flex-col items-center justify-center gap-1">
          <Edit3 size={16} className="text-white" />
          <span className="text-[9px] text-white font-bold">Edit</span>
        </button>
        <button onClick={onDelete} className="px-4 bg-red-600 flex flex-col items-center justify-center gap-1">
          <Trash2 size={16} className="text-white" />
          <span className="text-[9px] text-white font-bold">Delete</span>
        </button>
      </div>

      {/* card body */}
      <motion.div
        drag="x" dragConstraints={{ left: -120, right: 0 }}
        onDragEnd={(_, info) => setSwiped(info.offset.x < -60)}
        animate={{ x: swiped ? -120 : 0 }}
        className={`relative flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border ${isPrimary ? 'border-amber-400/40' : 'border-white/8'}`}
      >
        <div className="relative">
          <Avatar name={contact.name} relation={contact.relationship} />
          {isPrimary && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
              <Star size={10} className="text-black fill-black" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[15px] font-black text-white truncate">{contact.name}</p>
            {isPrimary && <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-[9px] font-black">ICE</span>}
          </div>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md text-white/60 bg-white/8 font-medium">{contact.relationship}</span>
          <p className="text-[12px] text-white/50 mt-1 font-mono">{contact.phone}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => window.location.href = `tel:${contact.phone}`}
            className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center border border-green-500/20">
            <Phone size={14} className="text-green-400" />
          </button>
          <button onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g,'')}`, '_blank')}
            className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
            <MessageSquare size={14} className="text-emerald-400" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
            <MapPin size={14} className="text-blue-400" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Add Contact Modal ──────────────────────────────────────── */
function AddModal({ onClose }: { onClose: () => void }) {
  const { addContact } = useUserStore();
  const [form, setForm] = useState({ name: '', phone: '', relationship: 'Friend' });

  const submit = () => {
    if (!form.name || !form.phone) return;
    addContact({
      id: Date.now().toString(), alertViaWhatsApp: true, alertOnSos: true,
      notifySms: true, notifyPush: true, notifyEmail: false,
      ...form,
    });
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full bg-[#0F1623] border-t border-white/10 rounded-t-3xl px-5 pt-5 pb-10 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-black text-white">Add Emergency Contact</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5"><X size={18} className="text-white/60" /></button>
        </div>

        {['name', 'phone'].map(field => (
          <input key={field} type={field === 'phone' ? 'tel' : 'text'}
            placeholder={field === 'name' ? 'Full Name' : '+91 Phone Number'}
            value={(form as any)[field]}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 text-[15px] focus:outline-none focus:border-amber-400/40" />
        ))}

        <div>
          <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2">Relationship</p>
          <div className="flex flex-wrap gap-2">
            {RELATIONS.map(r => (
              <button key={r} onClick={() => setForm(f => ({ ...f, relationship: r }))}
                className="px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all"
                style={{
                  background: form.relationship === r ? RELATION_COLORS[r] : 'rgba(255,255,255,0.06)',
                  color: form.relationship === r ? 'white' : 'rgba(255,255,255,0.5)',
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <button onClick={submit}
          className="w-full py-4 rounded-2xl bg-amber-400 text-black font-black text-[16px] mt-2">
          Add Contact
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export const EmergencyContactsScreen: React.FC = () => {
  const { contacts, primaryEmergencyContact, removeContact } = useUserStore();
  const [showAdd, setShowAdd] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const navigate = useNavigate();

  const sendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#080C14] pb-32">
      {/* header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Emergency Contacts</h1>
          <p className="text-white/40 text-[12px] mt-0.5">{contacts.length}/5 contacts added</p>
        </div>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 text-black font-black text-[13px]">
          <Plus size={16} /> Add
        </motion.button>
      </div>

      {/* contact list */}
      <div className="px-4">
        <AnimatePresence>
          {contacts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="text-6xl">👥</span>
              <p className="text-white/50 text-[15px]">No contacts yet.<br />Add someone who can help in emergencies.</p>
              <button onClick={() => setShowAdd(true)}
                className="px-6 py-3 rounded-2xl bg-amber-400 text-black font-black text-[15px]">
                Add First Contact
              </button>
            </motion.div>
          ) : (
            contacts.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}>
                <ContactCard contact={c} isPrimary={c.phone === primaryEmergencyContact || i === 0}
                  onDelete={() => removeContact(c.id)} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* info strip */}
      <div className="mx-4 mt-2 px-4 py-3 rounded-2xl bg-blue-500/8 border border-blue-500/15">
        <p className="text-[11px] text-blue-300/70 leading-relaxed">
          ↑ Swipe left on any card to edit or delete • First contact is your ICE (In Case of Emergency) contact
        </p>
      </div>

      {/* test button */}
      <div className="px-4 mt-6">
        <AnimatePresence mode="wait">
          {testSent ? (
            <motion.div key="sent" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full py-4 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 font-black text-[15px] text-center">
              ✓ Test messages sent to all contacts!
            </motion.div>
          ) : (
            <motion.button key="btn" whileTap={{ scale: 0.97 }} onClick={sendTest}
              className="w-full py-4 rounded-2xl border border-white/10 bg-white/3 text-white/60 font-bold text-[14px] flex items-center justify-center gap-2">
              <MessageSquare size={16} /> Test Emergency Alert
            </motion.button>
          )}
        </AnimatePresence>
        <p className="text-[11px] text-white/30 text-center mt-2">
          Sends: "This is a test from ROADSoS. [You] are safe."
        </p>
      </div>

      <AnimatePresence>
        {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyContactsScreen;
