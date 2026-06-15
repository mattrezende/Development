import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Download, Plus } from 'lucide-react';

import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

import ExpenseForm from '@/components/financial/ExpenseForm.jsx';
import CategoryForm from '@/components/financial/CategoryForm.jsx';
import ExpenseTable from '@/components/financial/ExpenseTable.jsx';
import CategoryList from '@/components/financial/CategoryList.jsx';
import FinancialSummaryCards from '@/components/financial/FinancialSummaryCards.jsx';
import FinancialCharts from '@/components/financial/FinancialCharts.jsx';
import { generateFinancialReport } from '@/lib/financialReportUtils.js';

const FinancialManagementPage = () => {
  const { currentUser } = useAuth();
  const chartsRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(true);
  
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  const fetchData = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const [expensesRes, categoriesRes, enrollmentsRes] = await Promise.all([
        pb.collection('expenses').getFullList({ filter: `teacher_id="${currentUser.id}"`, sort: '-date', $autoCancel: false }),
        pb.collection('expense_categories').getFullList({ filter: `teacher_id="${currentUser.id}"`, sort: 'name', $autoCancel: false }),
        pb.collection('enrollments').getFullList({ filter: `teacher_id="${currentUser.id}" && payment_status="approved"`, $autoCancel: false })
      ]);
      
      setExpenses(expensesRes);
      setCategories(categoriesRes);
      setEnrollments(enrollmentsRes);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Erro ao carregar dados financeiros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.id]);

  const categoriesMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});

  // Derived Data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const currentMonthEnrollments = enrollments.filter(e => {
    const d = new Date(e.created);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = currentMonthEnrollments.reduce((sum, e) => sum + (e.total_amount || e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const expensesByCategoryMap = currentMonthExpenses.reduce((acc, e) => {
    acc[e.category_id] = (acc[e.category_id] || 0) + e.amount;
    return acc;
  }, {});

  let highestCategory = null;
  let maxAmount = 0;
  Object.entries(expensesByCategoryMap).forEach(([catId, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      highestCategory = { name: categoriesMap[catId]?.name || 'Desconhecida', amount };
    }
  });

  const expensesByCategoryChart = Object.entries(expensesByCategoryMap).map(([catId, amount]) => ({
    name: categoriesMap[catId]?.name || 'Outros',
    value: amount,
    color: categoriesMap[catId]?.color || '#ccc'
  }));

  // Mocking 6 months data for charts based on actual data
  const last6Months = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('pt-BR', { month: 'short' }) };
  });

  const expensesVsRevenue = last6Months.map(m => {
    const mExpenses = expenses.filter(e => new Date(e.date).getMonth() === m.month && new Date(e.date).getFullYear() === m.year).reduce((sum, e) => sum + e.amount, 0);
    const mRevenue = enrollments.filter(e => new Date(e.created).getMonth() === m.month && new Date(e.created).getFullYear() === m.year).reduce((sum, e) => sum + (e.total_amount || e.amount || 0), 0);
    return { month: m.label, expenses: mExpenses, revenue: mRevenue };
  });

  // Handlers
  const handleSaveExpense = async (data) => {
    setIsSubmittingExpense(true);
    try {
      if (editingExpense) {
        await pb.collection('expenses').update(editingExpense.id, data, { $autoCancel: false });
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await pb.collection('expenses').create({ ...data, teacher_id: currentUser.id }, { $autoCancel: false });
        toast.success('Despesa adicionada com sucesso!');
      }
      setIsExpenseModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar despesa.');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
    try {
      await pb.collection('expenses').delete(id, { $autoCancel: false });
      toast.success('Despesa excluída.');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir despesa.');
    }
  };

  const handleCategoryCreated = () => {
    setIsCategoryModalOpen(false);
    fetchData(); // Refresh the category list
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await pb.collection('expense_categories').delete(id, { $autoCancel: false });
      toast.success('Categoria excluída.');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir categoria. Verifique se há despesas vinculadas.');
    }
  };

  const handleGenerateReport = async () => {
    try {
      toast.info('Gerando relatório...');
      await generateFinancialReport({
        month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        totalRevenue,
        totalExpenses,
        netProfit
      }, chartsRef);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório PDF.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestão Financeira - Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="max-w-7xl mx-auto space-y-8">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira</h1>
                  <p className="text-muted-foreground mt-1">Acompanhe suas receitas, despesas e gere relatórios.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerateReport}>
                    <Download className="w-4 h-4 mr-2" /> Relatório PDF
                  </Button>
                  <Button >
                    <Plus className="w-4 h-4 mr-2" /> Nova Receita
                  </Button>
                  <Button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> Nova Despesa
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="analytics">Visão Geral</TabsTrigger>
                  <TabsTrigger value="expenses">Despesas</TabsTrigger>
                  <TabsTrigger value="categories">Categorias</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-6 mt-6">
                  <FinancialSummaryCards 
                    totalExpenses={totalExpenses}
                    totalRevenue={totalRevenue}
                    netProfit={netProfit}
                    highestCategory={highestCategory}
                    isLoading={isLoading}
                  />
                  <div ref={chartsRef}>
                    <FinancialCharts 
                      expensesByCategory={expensesByCategoryChart}
                      expensesVsRevenue={expensesVsRevenue}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="expenses" className="mt-6">
                  <div className="bg-card rounded-xl border shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Lista de Despesas</h2>
                    </div>
                    <ExpenseTable 
                      expenses={expenses}
                      categoriesMap={categoriesMap}
                      onEdit={(exp) => { setEditingExpense(exp); setIsExpenseModalOpen(true); }}
                      onDelete={handleDeleteExpense}
                      isLoading={isLoading}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="mt-6">
                  <div className="bg-card rounded-xl border shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Categorias de Despesa</h2>
                      <Button variant="outline" onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Nova Categoria
                      </Button>
                    </div>
                    <CategoryList 
                      categories={categories}
                      onEdit={(cat) => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                      onDelete={handleDeleteCategory}
                      isLoading={isLoading}
                    />
                  </div>
                </TabsContent>
              </Tabs>

            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          </DialogHeader>
          <ExpenseForm 
            onSubmit={handleSaveExpense}
            initialData={editingExpense}
            categories={categories}
            isLoading={isSubmittingExpense}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            onCategoryCreated={handleCategoryCreated}
            initialData={editingCategory}
            onCancel={() => setIsCategoryModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinancialManagementPage;