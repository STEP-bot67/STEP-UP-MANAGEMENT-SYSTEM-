/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Store, 
  FileText, 
  Plus, 
  Trash2, 
  Edit2,
  ChevronRight,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Lock,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type FeeStatus = 'completed' | 'half' | 'below';

interface Student {
  id: string;
  name: string;
  studentId: string;
  feeStatus: FeeStatus;
  contribution: number;
  requiredFee: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Kiosk {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

// --- Mock Initial Data ---

const INITIAL_STUDENTS: Student[] = [
  { id: 'student-1', name: 'Alice Johnson', studentId: 'STU-001', feeStatus: 'completed', contribution: 500, requiredFee: 500 },
  { id: 'student-2', name: 'Bob Smith', studentId: 'STU-002', feeStatus: 'half', contribution: 250, requiredFee: 500 },
  { id: 'student-3', name: 'Charlie Brown', studentId: 'STU-003', feeStatus: 'below', contribution: 100, requiredFee: 500 },
  { id: 'student-4', name: 'Diana Prince', studentId: 'STU-004', feeStatus: 'completed', contribution: 500, requiredFee: 500 },
  { id: 'student-5', name: 'Edward Norton', studentId: 'STU-005', feeStatus: 'half', contribution: 250, requiredFee: 500 },
];

const INITIAL_SKILLS: Skill[] = [
  { id: 'skill-1', name: 'Web Development', category: 'IT' },
  { id: 'skill-2', name: 'Graphic Design', category: 'Creative' },
];

const INITIAL_KIOSKS: Kiosk[] = [
  { id: 'kiosk-1', name: 'Tech Hub Kiosk', location: 'Downtown', capacity: 5 },
  { id: 'kiosk-2', name: 'Creative Corner', location: 'Uptown', capacity: 3 },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'expense-1', description: 'Office Supplies', amount: 150, date: '2024-03-20' },
  { id: 'expense-2', description: 'Internet Bill', amount: 80, date: '2024-03-25' },
];

// --- Components ---

const MKIcon = ({ size = 20, className }: { size?: number, className?: string }) => (
  <span 
    className={cn("font-black leading-none flex items-center justify-center select-none", className)} 
    style={{ fontSize: size * 0.7, width: size, height: size }}
  >
    MK
  </span>
);

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'long', 
    year: '2-digit' 
  });

  return (
    <div className="px-5 py-3 rounded-2xl bg-slate-800 text-white font-mono font-black shadow-lg shadow-slate-200 flex flex-col items-center justify-center min-w-[160px] border border-slate-700 tracking-wider">
      <div className="text-[10px] uppercase text-slate-400 mb-0.5 tracking-[0.2em]">
        {dateStr}
      </div>
      <div className="text-sm">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </div>
    </div>
  );
};

const FormModal = ({ 
  title, 
  isOpen, 
  onClose, 
  children 
}: { 
  title: string, 
  isOpen: boolean, 
  onClose: () => void, 
  children: React.ReactNode 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-blue-100 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

const SecretCodeModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const VALID_CODES = ['18', '15', '57', '47', '49', '43'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(code)) {
      onConfirm();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Lock size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Authorization Required</h3>
        </div>
        <p className="text-slate-600 mb-6">Please enter the secret code to proceed with this transaction.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Code"
            className={cn(
              "w-full px-4 py-3 rounded-xl border outline-none transition-all",
              error ? "border-red-500 animate-shake" : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            )}
            autoFocus
          />
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Confirm
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const LoginPanel = ({ onLogin }: { onLogin: () => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const VALID_CODES = ['18', '15', '57', '47', '49', '43'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(code)) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mb-6">
            <TrendingUp size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">SMS <span className="text-blue-400">STEP UP</span></h1>
          <p className="text-slate-400 font-medium text-center">Student Management System Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Access Code</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••"
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white text-xl font-mono tracking-[0.5em] outline-none transition-all placeholder:text-slate-600",
                  error ? "border-red-500 ring-4 ring-red-500/10 animate-shake" : "border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                )}
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-xs font-bold text-center mt-2">Invalid access code. Please try again.</p>}
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
          >
            Unlock System
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs font-medium">
            Authorized Personnel Only • Secure Session
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'skills' | 'kiosks' | 'finance'>('dashboard');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [kiosks, setKiosks] = useState<Kiosk[]>(INITIAL_KIOSKS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  
  const [showSecretModal, setShowSecretModal] = useState<{ type: string, action: () => void } | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedKioskId, setSelectedKioskId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // --- Calculations ---

  const stats = useMemo(() => {
    const totalRegistered = students.length;
    const completed = students.filter(s => s.feeStatus === 'completed').length;
    const half = students.filter(s => s.feeStatus === 'half').length;
    const below = students.filter(s => s.feeStatus === 'below').length;
    
    const totalIncome = students.reduce((sum, s) => sum + s.contribution, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const reconciledAmount = totalIncome - totalExpenses;

    return { totalRegistered, completed, half, below, totalIncome, totalExpenses, reconciledAmount };
  }, [students, expenses]);

  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' }, // Green
    { name: 'Half', value: stats.half, color: '#f59e0b' },      // Yellow
    { name: 'Below', value: stats.below, color: '#ef4444' },     // Red
  ];

  const skillsByCategory = useMemo<Record<string, Skill[]>>(() => {
    const grouped: Record<string, Skill[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) grouped[skill.category] = [];
      grouped[skill.category].push(skill);
    });
    return grouped;
  }, [skills]);

  // --- Handlers ---

  const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

  const handleSecureAction = (action: () => void) => {
    setShowSecretModal({ type: 'action', action });
  };

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const studentId = formData.get('studentId') as string;
    const requiredFee = parseFloat(formData.get('requiredFee') as string || "500");
    if (name && studentId) {
      setStudents([...students, { 
        id: generateId(), 
        name, 
        studentId, 
        feeStatus: 'below', 
        contribution: 0,
        requiredFee
      }]);
      setActiveModal(null);
    }
  };

  const handleAddSkill = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    if (name && category) {
      setSkills([...skills, { id: generateId(), name, category }]);
      setActiveModal(null);
    }
  };

  const handleEditSkill = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    if (name && category && selectedSkillId) {
      handleSecureAction(() => {
        setSkills(skills.map(s => 
          s.id === selectedSkillId 
            ? { ...s, name, category } 
            : s
        ));
        setActiveModal(null);
        setSelectedSkillId(null);
      });
    }
  };

  const deleteSkill = (id: string) => {
    handleSecureAction(() => {
      setSkills(skills.filter(s => s.id !== id));
    });
  };

  const handleEditCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCategory = formData.get('category') as string;
    if (newCategory && editingCategory) {
      handleSecureAction(() => {
        setSkills(skills.map(s => 
          s.category === editingCategory 
            ? { ...s, category: newCategory } 
            : s
        ));
        setEditingCategory(null);
        setActiveModal(null);
      });
    }
  };

  const deleteCategory = (category: string) => {
    handleSecureAction(() => {
      setSkills(skills.filter(s => s.category !== category));
    });
  };

  const handleAddKiosk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const capacity = parseInt(formData.get('capacity') as string || "0");
    if (name && location) {
      setKiosks([...kiosks, { id: generateId(), name, location, capacity }]);
      setActiveModal(null);
    }
  };

  const handleEditKiosk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const capacity = parseInt(formData.get('capacity') as string || "0");
    if (name && location && selectedKioskId) {
      handleSecureAction(() => {
        setKiosks(kiosks.map(k => 
          k.id === selectedKioskId 
            ? { ...k, name, location, capacity } 
            : k
        ));
        setActiveModal(null);
        setSelectedKioskId(null);
      });
    }
  };

  const deleteKiosk = (id: string) => {
    handleSecureAction(() => {
      setKiosks(kiosks.filter(k => k.id !== id));
    });
  };

  const handleAddContribution = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string || "0");
    if (amount > 0 && selectedStudentId) {
      handleSecureAction(() => {
        setStudents(students.map(s => {
          if (s.id === selectedStudentId) {
            const newContribution = s.contribution + amount;
            let newStatus: FeeStatus = 'below';
            if (newContribution >= s.requiredFee) newStatus = 'completed';
            else if (newContribution >= s.requiredFee / 2) newStatus = 'half';
            return { ...s, contribution: newContribution, feeStatus: newStatus };
          }
          return s;
        }));
        setActiveModal(null);
        setSelectedStudentId(null);
      });
    }
  };

  const handleUpdateRequiredFee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const requiredFee = parseFloat(formData.get('requiredFee') as string || "0");
    if (requiredFee > 0 && selectedStudentId) {
      handleSecureAction(() => {
        setStudents(students.map(s => {
          if (s.id === selectedStudentId) {
            let newStatus: FeeStatus = 'below';
            if (s.contribution >= requiredFee) newStatus = 'completed';
            else if (s.contribution >= requiredFee / 2) newStatus = 'half';
            return { ...s, requiredFee, feeStatus: newStatus };
          }
          return s;
        }));
        setActiveModal(null);
        setSelectedStudentId(null);
      });
    }
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string || "0");
    if (description && amount > 0) {
      handleSecureAction(() => {
        setExpenses([...expenses, { 
          id: generateId(), 
          description, 
          amount, 
          date: new Date().toISOString().split('T')[0] 
        }]);
        setActiveModal(null);
      });
    }
  };

  const handleEditExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string || "0");
    if (description && amount > 0 && selectedExpenseId) {
      handleSecureAction(() => {
        setExpenses(expenses.map(exp => 
          exp.id === selectedExpenseId 
            ? { ...exp, description, amount } 
            : exp
        ));
        setActiveModal(null);
        setSelectedExpenseId(null);
      });
    }
  };

  const deleteExpense = (id: string) => {
    handleSecureAction(() => {
      setExpenses(expenses.filter(e => e.id !== id));
    });
  };

  const deleteStudent = (id: string) => {
    handleSecureAction(() => {
      setStudents(students.filter(s => s.id !== id));
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const timestamp = new Date().toLocaleString();
    
    // --- Header ---
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text("STEP UP MANAGEMENT SYSTEM (SMS)", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Comprehensive System Report", pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${timestamp}`, pageWidth - 20, 35, { align: 'right' });
    
    // --- Financial Summary Section ---
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("1. Financial Summary", 20, 45);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const summaryData = [
      ["Total Income", `MK ${stats.totalIncome.toLocaleString()}`],
      ["Total Expenses", `MK ${stats.totalExpenses.toLocaleString()}`],
      ["Reconciled Balance", `MK ${stats.reconciledAmount.toLocaleString()}`]
    ];
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      margin: { left: 20, right: 20 }
    });

    // --- Enrollment Status Section ---
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("2. Enrollment & Fee Status", 20, currentY);
    
    const enrollmentData = [
      ["Total Registered Students", stats.totalRegistered.toString()],
      ["Completed Payments", stats.completed.toString()],
      ["Half Payments", stats.half.toString()],
      ["Below Minimum", stats.below.toString()]
    ];
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Category', 'Count']],
      body: enrollmentData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], fontStyle: 'bold' }, // Emerald-500
      margin: { left: 20, right: 20 }
    });

    // --- Student Details Table ---
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text("3. Student Directory", 20, currentY);
    
    const studentRows = students.map(s => [
      s.name, 
      s.studentId, 
      s.feeStatus.toUpperCase(), 
      `MK ${s.requiredFee.toLocaleString()}`,
      `MK ${s.contribution.toLocaleString()}`
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Name', 'ID Number', 'Status', 'Required Fee', 'Contribution']],
      body: studentRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 20, right: 20 }
    });

    // --- Expenses Table ---
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(16);
    doc.text("4. Expense Log", 20, currentY);
    
    const expenseRows = expenses.map(e => [e.description, e.date, `MK ${e.amount.toLocaleString()}`]);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Description', 'Date', 'Amount']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] }, // Red-500
      margin: { left: 20, right: 20 }
    });

    // --- Kiosks & Skills Summary ---
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(16);
    doc.text("5. Operational Assets", 20, currentY);
    
    doc.setFontSize(12);
    doc.text(`Total OJT Kiosks: ${kiosks.length}`, 20, currentY + 10);
    doc.text(`Total Skills Cataloged: ${skills.length}`, 20, currentY + 17);

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
      doc.text("SMS - Step Up Management System | Confidential", pageWidth / 2, 290, { align: 'center' });
    }
    
    doc.save(`SMS_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- Render Sections ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Registered</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalRegistered}</h3>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Income</p>
            <h3 className="text-2xl font-bold text-slate-800">MK {stats.totalIncome.toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
            <ArrowDownRight size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Expenses</p>
            <h3 className="text-2xl font-bold text-slate-800">MK {stats.totalExpenses.toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-200 flex items-center gap-4 text-white">
          <div className="p-4 bg-white/20 rounded-2xl">
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-sm font-medium opacity-80">Reconciled</p>
            <h3 className="text-2xl font-bold">MK {stats.reconciledAmount.toLocaleString()}</h3>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            Fee Payment Distribution
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            Monthly Overview
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Income', amount: stats.totalIncome, fill: '#3b82f6' },
                { name: 'Expenses', amount: stats.totalExpenses, fill: '#ef4444' },
                { name: 'Net', amount: stats.reconciledAmount, fill: '#10b981' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => {
    const filteredStudents = students.filter(student => 
      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Student Directory</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search name or ID..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setActiveModal('student')}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 whitespace-nowrap"
            >
              <Plus size={20} /> Add Student
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-8 py-5 font-semibold">Name</th>
                <th className="px-8 py-5 font-semibold">ID Number</th>
                <th className="px-8 py-5 font-semibold">Fee Status</th>
                <th className="px-8 py-5 font-semibold">Required Fee</th>
                <th className="px-8 py-5 font-semibold">Contribution</th>
                <th className="px-8 py-5 font-semibold text-center">Update</th>
                <th className="px-8 py-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700">{student.name}</td>
                  <td className="px-8 py-5 text-slate-500">{student.studentId}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
                      student.feeStatus === 'completed' ? "bg-emerald-100 text-emerald-700" :
                      student.feeStatus === 'half' ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-mono font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      MK {student.requiredFee.toLocaleString()}
                      <button 
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setActiveModal('requiredFee');
                        }}
                        className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Update Required Fee"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono font-bold text-slate-600">MK {student.contribution.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setActiveModal('contribution');
                      }}
                      className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <MKIcon size={14} /> Update
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => deleteStudent(student.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-slate-400 italic">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSkills = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-800">Skills Catalog</h2>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            {skills.length} Total
          </span>
        </div>
        <button 
          onClick={() => setActiveModal('skill')}
          className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={20} /> Add Skill
        </button>
      </div>
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-10 pb-4">
          {(Object.entries(skillsByCategory) as [string, Skill[]][]).map(([category, categorySkills]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{category}</h3>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">
                    {categorySkills.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingCategory(category);
                      setActiveModal('editCategory');
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="Rename Category"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => deleteCategory(category)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorySkills.map(skill => (
                  <div key={skill.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{skill.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedSkillId(skill.id);
                          setActiveModal('editSkill');
                        }}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Edit Skill"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteSkill(skill.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Skill"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderKiosks = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">OJT Kiosks</h2>
        <button 
          onClick={() => setActiveModal('kiosk')}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Add Kiosk
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kiosks.map(kiosk => (
          <div key={kiosk.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Store size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Active Kiosk</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{kiosk.name}</h3>
              <p className="text-slate-500 flex items-center gap-1">
                <Store size={14} /> {kiosk.location}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Capacity</p>
                  <p className="text-lg font-bold text-slate-700">{kiosk.capacity} Students</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setSelectedKioskId(kiosk.id);
                  setActiveModal('editKiosk');
                }}
                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Edit Kiosk"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => deleteKiosk(kiosk.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Kiosk"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Financial Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveModal('expense')}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-200"
          >
            <Plus size={20} /> Add Expense
          </button>
          <button 
            onClick={exportPDF}
            className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
          >
            <FileText size={20} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-x-auto">
            <div className="px-8 py-6 border-bottom border-slate-100 flex justify-between items-center min-w-[600px]">
              <h3 className="font-bold text-slate-800">Recent Expenses</h3>
            </div>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-8 py-4 font-semibold">Description</th>
                  <th className="px-8 py-4 font-semibold">Date</th>
                  <th className="px-8 py-4 font-semibold text-right">Amount</th>
                  <th className="px-8 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-medium text-slate-700">{expense.description}</td>
                    <td className="px-8 py-4 text-slate-500 text-sm">{expense.date}</td>
                    <td className="px-8 py-4 text-right font-mono font-bold text-red-500">-MK {expense.amount.toLocaleString()}</td>
                    <td className="px-8 py-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedExpenseId(expense.id);
                          setActiveModal('editExpense');
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <p className="text-blue-100 text-sm font-medium mb-1">Reconciled Balance</p>
            <h3 className="text-4xl font-bold mb-6">MK {stats.reconciledAmount.toLocaleString()}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">Total Income</span>
                <span className="font-bold">MK {stats.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">Total Expenses</span>
                <span className="font-bold text-red-200">-MK {stats.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">System Status</p>
                <p className="text-xs font-bold mt-1">All transactions reconciled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return <LoginPanel onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">SMS <span className="text-blue-600">STEP UP</span></h1>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'students', icon: Users, label: 'Students' },
              { id: 'skills', icon: BookOpen, label: 'Skills' },
              { id: 'kiosks', icon: Store, label: 'Kiosks' },
              { id: 'finance', icon: MKIcon, label: 'Finance' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group",
                  activeTab === item.id 
                    ? "bg-blue-50 text-blue-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-transform group-hover:scale-110",
                  activeTab === item.id ? "text-blue-600" : "text-slate-300"
                )} />
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Support</p>
            <p className="text-sm text-slate-600 font-medium mb-4">Need help managing your system?</p>
            <a 
              href="mailto:Chinseualbert@gmail.com?subject=SMS Support Request&body=Hello Administrator,"
              className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              Contact Admin
            </a>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="w-full py-3 mt-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
            >
              <Lock size={14} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm group"
                title="Return to Dashboard"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <div>
              <h2 className="text-3xl font-black text-slate-800 capitalize">{activeTab}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">Albert Chinseu</p>
              <p className="text-xs text-slate-400 font-medium">Super Admin</p>
            </div>
            <DigitalClock />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'skills' && renderSkills()}
            {activeTab === 'kiosks' && renderKiosks()}
            {activeTab === 'finance' && renderFinance()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'student' && (
          <FormModal title="Add New Student" isOpen={true} onClose={() => setActiveModal(null)}>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Full Name</label>
                <input name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">ID Number</label>
                <input name="studentId" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. STU-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Required Contribution (MK)</label>
                <input name="requiredFee" type="number" defaultValue="500" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="500" />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Register Student
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'requiredFee' && (
          <FormModal title="Set Required Contribution" isOpen={true} onClose={() => { setActiveModal(null); setSelectedStudentId(null); }}>
            <form onSubmit={handleUpdateRequiredFee} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">New Required Amount (MK)</label>
                <input 
                  name="requiredFee" 
                  type="number" 
                  required 
                  defaultValue={students.find(s => s.id === selectedStudentId)?.requiredFee}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="0.00" 
                  autoFocus 
                />
              </div>
              <p className="text-xs text-slate-500 italic">Updating this will automatically recalculate the student's fee status.</p>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Update Benchmark
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'skill' && (
          <FormModal title="Add New Skill" isOpen={true} onClose={() => setActiveModal(null)}>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Skill Name</label>
                <input name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Data Analysis" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Category</label>
                <input name="category" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Technical" />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">
                Add Skill
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'editSkill' && (
          <FormModal title="Edit Skill" isOpen={true} onClose={() => { setActiveModal(null); setSelectedSkillId(null); }}>
            <form onSubmit={handleEditSkill} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Skill Name</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={skills.find(s => s.id === selectedSkillId)?.name}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="e.g. Data Analysis" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Category</label>
                <input 
                  name="category" 
                  required 
                  defaultValue={skills.find(s => s.id === selectedSkillId)?.category}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="e.g. Technical" 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Update Skill
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'editCategory' && (
          <FormModal title="Rename Category" isOpen={true} onClose={() => { setActiveModal(null); setEditingCategory(null); }}>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Category Name</label>
                <input 
                  name="category" 
                  required 
                  defaultValue={editingCategory || ''}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="e.g. Technical" 
                />
              </div>
              <p className="text-xs text-slate-500 italic">This will update the category for all skills within it.</p>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Rename Category
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'kiosk' && (
          <FormModal title="Add OJT Kiosk" isOpen={true} onClose={() => setActiveModal(null)}>
            <form onSubmit={handleAddKiosk} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Kiosk Name</label>
                <input name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. North Branch" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Location</label>
                <input name="location" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Sector 7" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Capacity (Students)</label>
                <input name="capacity" type="number" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. 10" />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Create Kiosk
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'editKiosk' && (
          <FormModal title="Edit OJT Kiosk" isOpen={true} onClose={() => { setActiveModal(null); setSelectedKioskId(null); }}>
            <form onSubmit={handleEditKiosk} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Kiosk Name</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={kiosks.find(k => k.id === selectedKioskId)?.name}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="e.g. North Branch" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Location</label>
                <input 
                  name="location" 
                  required 
                  defaultValue={kiosks.find(k => k.id === selectedKioskId)?.location}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="e.g. Sector 7" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Capacity (Students)</label>
                <input 
                  name="capacity" 
                  type="number" 
                  required 
                  defaultValue={kiosks.find(k => k.id === selectedKioskId)?.capacity}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="e.g. 10" 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Update Kiosk
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'contribution' && (
          <FormModal title="Add Contribution" isOpen={true} onClose={() => setActiveModal(null)}>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Amount (MK)</label>
                <input name="amount" type="number" step="0.01" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="0.00" autoFocus />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">
                Record Payment
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'expense' && (
          <FormModal title="Add Expense" isOpen={true} onClose={() => setActiveModal(null)}>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Description</label>
                <input name="description" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Electricity Bill" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Amount (MK)</label>
                <input name="amount" type="number" step="0.01" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" placeholder="0.00" />
              </div>
              <button type="submit" className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                Record Expense
              </button>
            </form>
          </FormModal>
        )}

        {activeModal === 'editExpense' && (
          <FormModal title="Edit Expense" isOpen={true} onClose={() => { setActiveModal(null); setSelectedExpenseId(null); }}>
            <form onSubmit={handleEditExpense} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Description</label>
                <input 
                  name="description" 
                  required 
                  defaultValue={expenses.find(e => e.id === selectedExpenseId)?.description}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="e.g. Electricity Bill" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Amount (MK)</label>
                <input 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  required 
                  defaultValue={expenses.find(e => e.id === selectedExpenseId)?.amount}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" 
                  placeholder="0.00" 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Update Expense
              </button>
            </form>
          </FormModal>
        )}

        {showSecretModal && (
          <SecretCodeModal 
            onConfirm={() => {
              showSecretModal.action();
              setShowSecretModal(null);
            }}
            onCancel={() => setShowSecretModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
