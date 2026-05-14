import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, MapPin, Plus, Trash2, Edit3, Star, X, User } from 'lucide-react';
import { useUserStore, type EmergencyContact } from '../store/userStore';

/* ── colour by relation ─────────────────────────────────────── */
const RELATION_COLORS: Record<string, string> = {
  Mother: 'var(--red)',
  Father: 'var(--blue)',
  Spouse: 'var(--purple)',
  Child: 'var(--saffron)',
  Sibling: 'var(--amber)',
  Friend: 'var(--green)',
  Doctor: 'var(--blue)',
  Other: 'var(--text-hint)',
};
const RELATIONS = Object.keys(RELATION_COLORS);

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Avatar ─────────────────────────────────────────────────── */
function Avatar({ name, relation, size = 52 }: { name: string; relation: string; size?: number }) {
  const color = RELATION_COLORS[relation] || RELATION_COLORS.Other;
  return (
    <div className="rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-lg"
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
    <div className="relative overflow-hidden rounded-2xl mb-3 group">
      {/* swipe-left actions */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        <button 
          onClick={() => setSwiped(false)} 
          className="px-4 bg-(--blue) flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all"
          aria-label={`Edit ${contact.name}`}
        >
          <Edit3 size={16} className="text-white" />
          <span className="text-[9px] text-white font-bold uppercase tracking-wider">Edit</span>
        </button>
        <button 
          onClick={onDelete} 
          className="px-4 bg-(--red) flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all"
          aria-label={`Delete ${contact.name}`}
        >
          <Trash2 size={16} className="text-white" />
          <span className="text-[9px] text-white font-bold uppercase tracking-wider">Delete</span>
        </button>
      </div>

      {/* card body */}
      <motion.div
        drag="x" dragConstraints={{ left: -120, right: 0 }}
        onDragEnd={(_, info) => setSwiped(info.offset.x < -60)}
        animate={{ x: swiped ? -120 : 0 }}
        className={`relative flex items-center gap-4 p-4 bg-raised backdrop-blur-md rounded-2xl border ${isPrimary ? 'border-(--amber)/40 shadow-(--amber-glow)' : 'border-white/5 shadow-sm'}`}
      >
        <div className="relative">
          <Avatar name={contact.name} relation={contact.relationship} />
          {isPrimary && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-(--amber) flex items-center justify-center border-2 border-base shadow-sm">
              <Star size={10} className="text-void fill-void" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[15px] font-black text-white truncate">{contact.name}</p>
            {isPrimary && <span className="px-1.5 py-0.5 rounded-md bg-(--amber)/20 text-(--amber) text-[9px] font-black tracking-widest">ICE</span>}
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-white/60 bg-white/5 font-bold uppercase tracking-wider border border-white/5">{contact.relationship}</span>
          <p className="text-[12px] text-white/50 mt-1.5 font-mono tracking-tighter">{contact.phone}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => window.location.href = `tel:${contact.phone}`}
            className="w-9 h-9 rounded-xl bg-green-soft flex items-center justify-center border border-(--green)/20 hover:bg-green/20 transition-all"
            aria-label={`Call ${contact.name}`}
            title={`Call ${contact.name}`}
          >
            <Phone size={14} className="text-(--green)" />
          </button>
          <button 
            onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g,'')}`, '_blank')}
            className="w-9 h-9 rounded-xl bg-green-soft flex items-center justify-center border border-(--green)/20 hover:bg-green/20 transition-all"
            aria-label={`WhatsApp ${contact.name}`}
            title={`WhatsApp ${contact.name}`}
          >
            <MessageSquare size={14} className="text-(--green)" />
          </button>
          <button 
            className="w-9 h-9 rounded-xl bg-blue-soft flex items-center justify-center border border-(--blue)/20 hover:bg-blue/20 transition-all"
            aria-label={`Request location from ${contact.name}`}
            title={`Request location from ${contact.name}`}
          >
            <MapPin size={14} className="text-(--blue)" />
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
      <div className="absolute inset-0 bg-void/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full bg-overlay border-t border-white/10 rounded-t-[32px] px-5 pt-6 pb-12 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">New Contact</h2>
            <p className="text-[12px] text-white/40">Add someone who can help in emergencies</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-4">
          {(['name', 'phone'] as const).map((field) => (
            <div key={field} className="relative">
              <input type={field === 'phone' ? 'tel' : 'text'}
                placeholder={field === 'name' ? 'Full Name' : '+91 Phone Number'}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/25 text-[16px] focus:outline-none focus:border-focus focus:bg-white/8 transition-all" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                {field === 'name' ? <User size={18} /> : <Phone size={18} />}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <p className="text-[11px] text-white/30 font-black uppercase tracking-widest mb-3 ml-1">Relationship</p>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, relationship: r }))}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all border"
                  style={{
                    background: form.relationship === r ? RELATION_COLORS[r] : 'transparent',
                    borderColor: form.relationship === r ? 'transparent' : 'rgba(255,255,255,0.08)',
                    color: form.relationship === r ? 'white' : 'rgba(255,255,255,0.4)',
                    boxShadow: form.relationship === r ? `0 4px 12px ${RELATION_COLORS[r].replace('var(', 'rgba(').replace(')', ', 0.2)')}` : 'none'
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={submit}
          className="w-full py-4.5 rounded-2xl bg-(--saffron) text-void font-black text-[16px] mt-8 shadow-lg shadow-saffron">
          Save Contact
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
const EmergencyContactsScreen: React.FC = () => {
  const { contacts, primaryEmergencyContact, removeContact } = useUserStore();
  const [showAdd, setShowAdd] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const sendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-base pb-32 overflow-x-hidden">
      {/* header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-6 border-b border-white/5 bg-base/80 backdrop-blur-xl sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Emergency Contacts</h1>
          <p className="text-white/40 text-[12px] mt-0.5" aria-live="polite">
            {contacts.length}/5 contacts added
          </p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.93 }} 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-(--saffron) text-void font-black text-[13px] border border-(--saffron)/50 shadow-saffron"
          aria-label="Add new emergency contact"
        >
          <Plus size={16} /> Add
        </motion.button>
      </header>

      {/* contact list */}
      <main className="px-4 pt-6" aria-label="Emergency contacts list">
        <AnimatePresence mode="popLayout">
          {contacts.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-raised border border-white/5 flex items-center justify-center text-5xl mb-2 shadow-inner">
                👥
              </div>
              <p className="text-white/50 text-[16px] font-medium px-8">No contacts yet.<br />Add someone who can help in emergencies.</p>
              <button 
                onClick={() => setShowAdd(true)}
                className="mt-4 px-8 py-4 rounded-2xl bg-(--saffron) text-void font-black text-[15px] hover:scale-105 transition-transform shadow-saffron"
              >
                Add First Contact
              </button>
            </motion.div>
          ) : (
            <ul className="space-y-3" role="list">
              {contacts.map((c, i) => (
                <li key={c.id} role="listitem">
                  <motion.div 
                    initial={{ opacity: 0, x: -16 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ContactCard 
                      contact={c} 
                      isPrimary={c.phone === primaryEmergencyContact || i === 0}
                      onDelete={() => removeContact(c.id)} 
                    />
                  </motion.div>
                </li>
              ))}
            </ul>
          )}
        </AnimatePresence>
      </main>

      {/* info strip */}
      <div className="mx-4 mt-6 px-4 py-4 rounded-2xl bg-blue-soft border border-(--blue)/15 flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-(--blue) mt-1.5 shrink-0 animate-pulse" />
        <p className="text-[12px] text-blue-300/70 leading-relaxed font-medium">
          Swipe left on any card to edit or delete. The first contact in your list is designated as your primary ICE (In Case of Emergency) contact.
        </p>
      </div>

      {/* test button */}
      <div className="px-4 mt-10">
        <AnimatePresence mode="wait">
          {testSent ? (
            <motion.div 
              key="sent" 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full py-5 rounded-2xl bg-green-soft border border-(--green)/30 text-(--green) font-black text-[15px] text-center shadow-green"
              role="alert"
            >
              ✓ Test messages sent to all contacts!
            </motion.div>
          ) : (
            <motion.button 
              key="btn" 
              whileTap={{ scale: 0.97 }} 
              onClick={sendTest}
              className="w-full py-5 rounded-2xl border border-white/10 bg-raised text-white/60 font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all shadow-sm"
              aria-label="Send test emergency alert to all contacts"
            >
              <MessageSquare size={16} className="text-(--blue)" /> Test Emergency Alert
            </motion.button>
          )}
        </AnimatePresence>
        <p className="text-[11px] text-white/20 text-center mt-4 uppercase tracking-widest font-black">
          "This is a test from ROADSoS. I am testing my emergency contact settings."
        </p>
      </div>

      <AnimatePresence>
        {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyContactsScreen;
