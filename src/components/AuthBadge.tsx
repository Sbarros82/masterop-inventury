import React, { useState } from 'react';
import { Shield, User, ChevronDown, LogOut, Key } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthBadgeProps {
  currentUser: UserType;
  onChangeUser: (user: UserType) => void;
}

export function AuthBadge({ currentUser, onChangeUser }: AuthBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableUsers: UserType[] = [
    { id: 'usr-1', name: 'Sergio MasterOp', email: 'sergio@masterop.com.br', role: 'admin' },
    { id: 'usr-2', name: 'Maria Silva (Op)', email: 'maria.silva@masterop.com.br', role: 'operator' },
    { id: 'usr-3', name: 'Carlos Auditor', email: 'carlos.auditor@masterop.com.br', role: 'auditor' },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      case 'operator':
        return { label: 'Operador', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      case 'auditor':
        return { label: 'Auditor Externo', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      default:
        return { label: 'Usuário', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    }
  };

  const badgeStyle = getRoleLabel(currentUser.role);

  return (
    <div className="relative" id="auth-badge-container">
      <button
        id="auth-badge-button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-xs hover:border-slate-200 transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            {currentUser.role === 'admin' ? (
              <Shield className="w-5 h-5 text-indigo-600 animate-pulse" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${badgeStyle.color}`}>
                {badgeStyle.label}
              </span>
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-185' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="auth-badge-dropdown"
          className="absolute left-0 right-0 mt-2 p-1.5 bg-white border border-slate-200/80 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Simular Login de Usuário
          </div>
          {availableUsers.map((usr) => (
            <button
              key={usr.id}
              onClick={() => {
                onChangeUser(usr);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                usr.id === currentUser.id 
                  ? 'bg-slate-50 text-slate-900 font-medium' 
                  : 'hover:bg-slate-50/60 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Shield className={`w-4 h-4 ${usr.role === 'admin' ? 'text-emerald-500' : usr.role === 'operator' ? 'text-blue-500' : 'text-amber-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{usr.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{usr.email}</p>
              </div>
            </button>
          ))}
          <div className="border-t border-slate-100 my-1.5"></div>
          <div className="p-2 text-[10px] text-slate-400 leading-normal flex gap-1 items-start bg-slate-50/50 rounded-lg m-1">
            <Key className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>As permissões do sistema adaptam-se ao cargo simulado.</span>
          </div>
        </div>
      )}
    </div>
  );
}
