import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import AccountList from '../components/AccountList';
import TransactionList from '../components/TransactionList';
import GoalList from '../components/GoalList';
import OperationModal from '../components/modals/OperationModal';
import AccountModal from '../components/modals/AccountModal';
import GoalModal from '../components/modals/GoalModal';
import CalculatorModal from '../components/modals/CalculatorModal';
import { Transaction, Account, Goal } from '../types';
import { Plus, Calculator } from 'lucide-react';

const Finance = () => {
    const { state, dispatch } = useStore();

    // Modal states
    const [isOpModalOpen, setOpModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | undefined>(undefined);

    const [isAccModalOpen, setAccModalOpen] = useState(false);
    const [editingAcc, setEditingAcc] = useState<Account | undefined>(undefined);

    const [isGoalModalOpen, setGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

    const [isCalcModalOpen, setCalcModalOpen] = useState(false);

    const handleEditTx = (tx: Transaction) => {
        setEditingTx(tx);
        setOpModalOpen(true);
    };

    const handleDeleteTx = (id: string) => {
        if (confirm('Удалить операцию?')) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        }
    };

    const handleEditAcc = (acc: Account) => {
        setEditingAcc(acc);
        setAccModalOpen(true);
    };

    const handleEditGoal = (g: Goal) => {
        setEditingGoal(g);
        setGoalModalOpen(true);
    };

    const handleDeleteGoal = (id: string) => {
        if (confirm('Удалить цель?')) {
            dispatch({ type: 'DELETE_GOAL', payload: id });
        }
    };

    const handleAddTx = () => {
        setEditingTx(undefined);
        setOpModalOpen(true);
    };

    const handleAddAcc = () => {
        setEditingAcc(undefined);
        setAccModalOpen(true);
    };

    const handleAddGoal = () => {
        setEditingGoal(undefined);
        setGoalModalOpen(true);
    };

    return (
        <div className="page-content" style={{ paddingBottom: '90px' }}>
            <header style={{ padding: '20px', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '28px', fontWeight: 700 }}>Финансы</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Счета и операции</p>
                </div>
                <button
                    onClick={() => setCalcModalOpen(true)}
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Calculator size={20} />
                </button>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ padding: '0 20px', fontSize: '14px', marginBottom: '10px', color: 'var(--text-muted)' }}>Мои счета</h3>
                <AccountList onAddAccount={handleAddAcc} onEditAccount={handleEditAcc} />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <GoalList onAdd={handleAddGoal} onEdit={handleEditGoal} onDelete={handleDeleteGoal} />
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>История операций</h3>
                    {/* Filter button could go here */}
                </div>
                <TransactionList
                    transactions={[...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                    onEdit={handleEditTx}
                    onDelete={handleDeleteTx}
                />
            </div>

            {/* FAB */}
            <button
                onClick={handleAddTx}
                style={{
                    position: 'fixed', bottom: '95px', right: '20px',
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--accent-gradient)', color: 'white',
                    border: 'none', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 900
                }}
            >
                <Plus size={28} />
            </button>

            <OperationModal
                isOpen={isOpModalOpen}
                onClose={() => setOpModalOpen(false)}
                initialData={editingTx}
            />

            <AccountModal
                isOpen={isAccModalOpen}
                onClose={() => setAccModalOpen(false)}
                initialData={editingAcc}
            />

            <GoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setGoalModalOpen(false)}
                initialData={editingGoal}
            />

            <CalculatorModal
                isOpen={isCalcModalOpen}
                onClose={() => setCalcModalOpen(false)}
            />
        </div>
    );
};

export default Finance;
