import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, UserPlus, Phone, User, Trash2, 
  CheckCircle2, Clock, MessageSquare, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const TrustedContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const { trustedContacts, addContact, removeContact } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    addContact({ name: newName, phone: newPhone });
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text) pb-20">
      <header className="sticky top-0 z-50 bg-(--clr-bg)/80 backdrop-blur-md border-b border-(--clr-border) px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Trusted Contacts</h1>
            <p className="text-[10px] font-mono text-(--clr-blue) tracking-widest uppercase">Emergency Circle</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-(--clr-blue)/5 border border-(--clr-blue)/20 rounded-2xl p-6 mb-8">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-(--clr-blue) text-white rounded-xl shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold mb-1">How it works</h3>
              <p className="text-sm text-(--clr-text-2) leading-relaxed">
                When you trigger an SOS, your trusted contacts will receive a real-time notification with your live location via <strong>WhatsApp</strong> and <strong>SMS</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-(--clr-text-2) uppercase tracking-wider">Your Contacts</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-(--clr-blue) text-sm font-bold hover:bg-(--clr-blue)/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Add New
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isAdding && (
              <motion.form
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleAdd}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-(--clr-text-2) uppercase ml-1">Contact Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--clr-text-2)" />
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-(--clr-blue) outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-(--clr-text-2) uppercase ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--clr-text-2)" />
                      <input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-(--clr-blue) outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-(--clr-blue) text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                  >
                    SEND INVITE
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-3 bg-white/5 text-(--clr-text) font-bold rounded-xl"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.form>
            )}

            {trustedContacts.length === 0 && !isAdding ? (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-(--clr-text-2)">
                  <UserPlus size={32} />
                </div>
                <h3 className="font-bold text-(--clr-text-2)">No contacts added yet</h3>
                <p className="text-xs text-white/30 max-w-[200px] mx-auto mt-1">Add trusted people to your emergency circle.</p>
              </div>
            ) : (
              trustedContacts.map((contact) => (
                <motion.div
                  layout
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-(--clr-blue)/10 flex items-center justify-center text-(--clr-blue) font-bold text-lg">
                      {contact.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold">{contact.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-(--clr-text-2) mt-0.5">
                        <Phone size={10} />
                        {contact.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${
                      contact.status === 'Accepted' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {contact.status === 'Accepted' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {contact.status.toUpperCase()}
                    </div>
                    <button 
                      onClick={() => removeContact(contact.id)}
                      className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {trustedContacts.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-xs text-(--clr-text-2) flex items-center justify-center gap-2">
              <MessageSquare size={14} /> Contacts receive a WhatsApp invite on joining.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
