
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';
import jsPDF from 'jspdf';

const PayrollModule = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, [selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const records = await pb.collection('employees').getFullList({
        filter: 'status = "active"',
        $autoCancel: false
      });
      setEmployees(records);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const records = await pb.collection('payroll').getFullList({
        filter: `month = ${selectedMonth} && year = ${selectedYear}`,
        expand: 'employee_id',
        sort: '-created',
        $autoCancel: false
      });
      setPayrolls(records);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as folhas de pagamento',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTaxes = (grossSalary) => {
    const inss = grossSalary * 0.08;
    
    let ir = 0;
    if (grossSalary > 4664.68) {
      ir = (grossSalary - 4664.68) * 0.275 + 869.36;
    } else if (grossSalary > 3751.05) {
      ir = (grossSalary - 3751.05) * 0.225 + 636.13;
    } else if (grossSalary > 2826.65) {
      ir = (grossSalary - 2826.65) * 0.15 + 354.80;
    } else if (grossSalary > 1903.98) {
      ir = (grossSalary - 1903.98) * 0.075;
    }
    
    const fgts = grossSalary * 0.08;
    const netSalary = grossSalary - inss - ir - fgts;

    return {
      inss: parseFloat(inss.toFixed(2)),
      ir: parseFloat(ir.toFixed(2)),
      fgts: parseFloat(fgts.toFixed(2)),
      netSalary: parseFloat(netSalary.toFixed(2))
    };
  };

  const handleGeneratePayroll = async () => {
    if (employees.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Não há funcionários ativos para gerar folha de pagamento',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);

    try {
      for (const employee of employees) {
        const taxes = calculateTaxes(employee.salary);
        
        await pb.collection('payroll').create({
          employee_id: employee.id,
          month: selectedMonth,
          year: selectedYear,
          gross_salary: employee.salary,
          inss_deduction: taxes.inss,
          ir_deduction: taxes.ir,
          fgts_deduction: taxes.fgts,
          net_salary: taxes.netSalary
        }, { $autoCancel: false });
      }

      toast({
        title: 'Sucesso',
        description: `Folha de pagamento gerada para ${employees.length} funcionários`
      });
      
      fetchPayrolls();
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a folha de pagamento',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = (payroll) => {
    const doc = new jsPDF();
    const employee = payroll.expand?.employee_id;

    doc.setFontSize(18);
    doc.text('Holerite - Folha de Pagamento', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Funcionário: ${employee?.name || 'N/A'}`, 20, 40);
    doc.text(`CPF: ${employee?.cpf || 'N/A'}`, 20, 50);
    doc.text(`Cargo: ${employee?.position || 'N/A'}`, 20, 60);
    doc.text(`Departamento: ${employee?.department || 'N/A'}`, 20, 70);
    
    doc.text(`Mês/Ano: ${selectedMonth}/${selectedYear}`, 20, 90);
    
    doc.text(`Salário Bruto: R$ ${payroll.gross_salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 110);
    doc.text(`INSS: R$ ${payroll.inss_deduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 120);
    doc.text(`IR: R$ ${payroll.ir_deduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 130);
    doc.text(`FGTS: R$ ${payroll.fgts_deduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 140);
    
    doc.setFontSize(14);
    doc.text(`Salário Líquido: R$ ${payroll.net_salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 160);

    doc.save(`holerite_${employee?.name}_${selectedMonth}_${selectedYear}.pdf`);
  };

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando folhas de pagamento...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Folha de Pagamento - Sistema de Gestão de RH</title>
        <meta name="description" content="Gere e gerencie folhas de pagamento" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Folha de Pagamento</h1>
            <p className="text-gray-600 mt-2">Gere e gerencie folhas de pagamento mensais</p>
          </div>

          <Card className="border border-gray-200 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Gerar Folha de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleGeneratePayroll}
                  disabled={generating || payrolls.length > 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {generating ? 'Gerando...' : payrolls.length > 0 ? 'Já Gerado' : 'Gerar Folha'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle>Folhas de Pagamento ({payrolls.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Salário Bruto</TableHead>
                      <TableHead>INSS</TableHead>
                      <TableHead>IR</TableHead>
                      <TableHead>FGTS</TableHead>
                      <TableHead>Salário Líquido</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrolls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Nenhuma folha de pagamento gerada para este período
                        </TableCell>
                      </TableRow>
                    ) : (
                      payrolls.map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell className="font-medium">
                            {payroll.expand?.employee_id?.name || 'N/A'}
                          </TableCell>
                          <TableCell>R$ {payroll.gross_salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>R$ {payroll.inss_deduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>R$ {payroll.ir_deduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>R$ {payroll.fgts_deduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="font-bold">R$ {payroll.net_salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(payroll)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PayrollModule;
