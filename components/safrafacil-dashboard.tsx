"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sprout,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  Search,
  Plus,
  Tractor,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

const initialProducts = [
  { id: 1, name: "Tomate", category: "Hortaliça", unit: "kg", price: 8.5, stock: 120 },
  { id: 2, name: "Alface", category: "Hortaliça", unit: "un", price: 3.5, stock: 80 },
  { id: 3, name: "Ovos Caipira", category: "Granja", unit: "dz", price: 18, stock: 42 },
];

const initialCustomers = [
  { id: 1, name: "Mercado Bom Preço", phone: "(11) 99999-1111", city: "Salto" },
  { id: 2, name: "Feira Central", phone: "(11) 99999-2222", city: "Itu" },
  { id: 3, name: "Cliente João", phone: "(11) 99999-3333", city: "Indaiatuba" },
];

const initialSales = [
  {
    id: 1,
    customer: "Mercado Bom Preço",
    product: "Tomate",
    qty: 25,
    total: 212.5,
    payment: "Pix",
    status: "Recebido",
    date: "2026-04-18",
  },
  {
    id: 2,
    customer: "Cliente João",
    product: "Ovos Caipira",
    qty: 6,
    total: 108,
    payment: "Fiado",
    status: "Pendente",
    date: "2026-04-19",
  },
  {
    id: 3,
    customer: "Feira Central",
    product: "Alface",
    qty: 20,
    total: 70,
    payment: "Dinheiro",
    status: "Recebido",
    date: "2026-04-20",
  },
];

const initialExpenses = [
  { id: 1, category: "Combustível", description: "Entrega da semana", amount: 95, date: "2026-04-18" },
  { id: 2, category: "Embalagem", description: "Caixas plásticas", amount: 140, date: "2026-04-19" },
  { id: 3, category: "Sementes", description: "Reposição de cultivo", amount: 210, date: "2026-04-20" },
];

const monthlySalesData = [
  { name: "Jan", vendas: 980 },
  { name: "Fev", vendas: 1320 },
  { name: "Mar", vendas: 1150 },
  { name: "Abr", vendas: 1680 },
];

type KPIProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
};

function KPI({ title, value, icon: Icon, subtitle }: KPIProps) {
  return (
    <Card className="rounded-2xl border-0 bg-white/90 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">{value}</h3>
            <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type Product = {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  city: string;
};

type Sale = {
  id: number;
  customer: string;
  product: string;
  qty: number;
  total: number;
  payment: string;
  status: string;
  date: string;
};

type Expense = {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export default function SafraFacilDashboard() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    unit: "kg",
    price: "",
    stock: "",
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    city: "",
  });

  const [newSale, setNewSale] = useState({
    customer: "",
    product: "",
    qty: "",
    payment: "Pix",
    status: "Recebido",
    date: "2026-04-20",
  });

  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    date: "2026-04-20",
  });

  const totalSold = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalPending = sales
    .filter((sale) => sale.status === "Pendente")
    .reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const estimatedProfit = totalSold - totalExpenses;
  const lowStock = products.filter((product) => product.stock <= 50).length;

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.city.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  const addProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) return;

    setProducts((prev) => [
      {
        id: prev.length + 1,
        name: newProduct.name,
        category: newProduct.category,
        unit: newProduct.unit,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock || 0),
      },
      ...prev,
    ]);

    setNewProduct({
      name: "",
      category: "",
      unit: "kg",
      price: "",
      stock: "",
    });
  };

  const addCustomer = () => {
    if (!newCustomer.name) return;

    setCustomers((prev) => [
      { id: prev.length + 1, ...newCustomer },
      ...prev,
    ]);

    setNewCustomer({
      name: "",
      phone: "",
      city: "",
    });
  };

  const addSale = () => {
    if (!newSale.customer || !newSale.product || !newSale.qty) return;

    const selectedProduct = products.find((p) => p.name === newSale.product);
    const qty = Number(newSale.qty);
    const total = qty * (selectedProduct?.price || 0);

    setSales((prev) => [
      {
        id: prev.length + 1,
        customer: newSale.customer,
        product: newSale.product,
        qty,
        total,
        payment: newSale.payment,
        status: newSale.status,
        date: newSale.date,
      },
      ...prev,
    ]);

    setProducts((prev) =>
      prev.map((product) =>
        product.name === newSale.product
          ? { ...product, stock: Math.max(0, product.stock - qty) }
          : product
      )
    );

    setNewSale({
      customer: "",
      product: "",
      qty: "",
      payment: "Pix",
      status: "Recebido",
      date: "2026-04-20",
    });
  };

  const addExpense = () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount) return;

    setExpenses((prev) => [
      {
        id: prev.length + 1,
        category: newExpense.category,
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: newExpense.date,
      },
      ...prev,
    ]);

    setNewExpense({
      category: "",
      description: "",
      amount: "",
      date: "2026-04-20",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r bg-white p-5 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">SafraFácil</h1>
              <p className="text-sm text-slate-500">Gestão rural simples</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            
  {[
  { icon: BarChart3, label: "Dashboard" },
  { icon: Package, label: "Produtos" },
  { icon: Users, label: "Clientes" },
  { icon: ShoppingCart, label: "Vendas" },
  { icon: Wallet, label: "Despesas" },
  { icon: Tractor, label: "Produção" },
].map((item) => {
  const NavIcon = item.icon;
              

              return (
                <div
                  key={item.label}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-100"
                >
                  <NavIcon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto">
            <Card className="rounded-2xl border-0 bg-slate-900 text-white">
              <CardContent className="p-4">
                <p className="text-sm font-medium">Versão MVP</p>
                <p className="mt-1 text-xs text-slate-300">
                  Primeira interface navegável do produto.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">Painel do produtor</h2>
                <p className="mt-1 text-slate-500">
                  Controle vendas, clientes, estoque e despesas em um só lugar.
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="rounded-2xl">Exportar</Button>
                <Button variant="outline" className="rounded-2xl">
                  Compartilhar
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <KPI
                title="Vendido no período"
                value={`R$ ${totalSold.toFixed(2)}`}
                subtitle="Total das vendas registradas"
                icon={ShoppingCart}
              />
              <KPI
                title="A receber"
                value={`R$ ${totalPending.toFixed(2)}`}
                subtitle="Vendas pendentes"
                icon={Wallet}
              />
              <KPI
                title="Despesas"
                value={`R$ ${totalExpenses.toFixed(2)}`}
                subtitle="Custos lançados"
                icon={AlertTriangle}
              />
              <KPI
                title="Lucro estimado"
                value={`R$ ${estimatedProfit.toFixed(2)}`}
                subtitle="Vendas menos despesas"
                icon={BarChart3}
              />
              <KPI
                title="Estoque baixo"
                value={String(lowStock)}
                subtitle="Produtos com alerta"
                icon={Package}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <Card className="rounded-2xl border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Vendas por mês</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySalesData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="vendas" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Alertas rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {products
                    .filter((p) => p.stock <= 50)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border bg-slate-50 p-4"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-slate-500">
                            Estoque atual: {item.stock} {item.unit}
                          </p>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          Atenção
                        </Badge>
                      </div>
                    ))}

                  {sales
                    .filter((s) => s.status === "Pendente")
                    .map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border bg-slate-50 p-4"
                      >
                        <div>
                          <p className="font-medium">Receber de {sale.customer}</p>
                          <p className="text-sm text-slate-500">
                            R$ {sale.total.toFixed(2)} • {sale.product}
                          </p>
                        </div>
                        <Badge className="rounded-full">Pendente</Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="produtos" className="space-y-6">
              <TabsList className="grid max-w-2xl grid-cols-4 rounded-2xl">
                <TabsTrigger value="produtos" className="rounded-2xl">
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="clientes" className="rounded-2xl">
                  Clientes
                </TabsTrigger>
                <TabsTrigger value="vendas" className="rounded-2xl">
                  Vendas
                </TabsTrigger>
                <TabsTrigger value="despesas" className="rounded-2xl">
                  Despesas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="produtos">
                <Card className="rounded-2xl border-0 bg-white shadow-sm">
                  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle>Produtos cadastrados</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Buscar produto"
                          className="rounded-2xl pl-9"
                        />
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="rounded-2xl">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="rounded-3xl">
                          <DialogHeader>
                            <DialogTitle>Novo produto</DialogTitle>
                          </DialogHeader>

                          <div className="grid gap-4">
                            <div>
                              <Label>Nome</Label>
                              <Input
                                value={newProduct.name}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, name: e.target.value })
                                }
                                className="mt-2 rounded-2xl"
                              />
                            </div>

                            <div>
                              <Label>Categoria</Label>
                              <Input
                                value={newProduct.category}
                                onChange={(e) =>
                                  setNewProduct({
                                    ...newProduct,
                                    category: e.target.value,
                                  })
                                }
                                className="mt-2 rounded-2xl"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label>Unidade</Label>
                                <Select
                                  value={newProduct.unit}
                                  onValueChange={(value) =>
                                    setNewProduct({ ...newProduct, unit: value })
                                  }
                                >
                                  <SelectTrigger className="mt-2 rounded-2xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="un">un</SelectItem>
                                    <SelectItem value="dz">dz</SelectItem>
                                    <SelectItem value="cx">caixa</SelectItem>
                                    <SelectItem value="l">litro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Preço</Label>
                                <Input
                                  type="number"
                                  value={newProduct.price}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      price: e.target.value,
                                    })
                                  }
                                  className="mt-2 rounded-2xl"
                                />
                              </div>

                              <div>
                                <Label>Estoque</Label>
                                <Input
                                  type="number"
                                  value={newProduct.stock}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      stock: e.target.value,
                                    })
                                  }
                                  className="mt-2 rounded-2xl"
                                />
                              </div>
                            </div>

                            <Button onClick={addProduct} className="rounded-2xl">
                              Salvar produto
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Estoque</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clientes">
                <Card className="rounded-2xl border-0 bg-white shadow-sm">
                  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle>Clientes</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Buscar cliente"
                          className="rounded-2xl pl-9"
                        />
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="rounded-2xl">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="rounded-3xl">
                          <DialogHeader>
                            <DialogTitle>Novo cliente</DialogTitle>
                          </DialogHeader>

                          <div className="grid gap-4">
                            <div>
                              <Label>Nome</Label>
                              <Input
                                value={newCustomer.name}
                                onChange={(e) =>
                                  setNewCustomer({
                                    ...newCustomer,
                                    name: e.target.value,
                                  })
                                }
                                className="mt-2 rounded-2xl"
                              />
                            </div>

                            <div>
                              <Label>Telefone</Label>
                              <Input
                                value={newCustomer.phone}
                                onChange={(e) =>
                                  setNewCustomer({
                                    ...newCustomer,
                                    phone: e.target.value,
                                  })
                                }
                                className="mt-2 rounded-2xl"
                              />
                            </div>

                            <div>
                              <Label>Cidade</Label>
                              <Input
                                value={newCustomer.city}
                                onChange={(e) =>
                                  setNewCustomer({
                                    ...newCustomer,
                                    city: e.target.value,
                                  })
                                }
                                className="mt-2 rounded-2xl"
                              />
                            </div>

                            <Button onClick={addCustomer} className="rounded-2xl">
                              Salvar cliente
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Cidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.city}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vendas">
                <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                  <Card className="rounded-2xl border-0 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>Histórico de vendas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sales.map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell>{sale.date}</TableCell>
                              <TableCell>{sale.customer}</TableCell>
                              <TableCell>{sale.product}</TableCell>
                              <TableCell>{sale.qty}</TableCell>
                              <TableCell>R$ {sale.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={sale.status === "Pendente" ? "secondary" : "default"}
                                  className="rounded-full"
                                >
                                  {sale.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-0 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>Nova venda</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div>
                        <Label>Cliente</Label>
                        <Select
                          value={newSale.customer}
                          onValueChange={(value) =>
                            setNewSale({ ...newSale, customer: value })
                          }
                        >
                          <SelectTrigger className="mt-2 rounded-2xl">
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.name}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Produto</Label>
                        <Select
                          value={newSale.product}
                          onValueChange={(value) =>
                            setNewSale({ ...newSale, product: value })
                          }
                        >
                          <SelectTrigger className="mt-2 rounded-2xl">
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.name}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            value={newSale.qty}
                            onChange={(e) =>
                              setNewSale({ ...newSale, qty: e.target.value })
                            }
                            className="mt-2 rounded-2xl"
                          />
                        </div>

                        <div>
                          <Label>Data</Label>
                          <Input
                            type="date"
                            value={newSale.date}
                            onChange={(e) =>
                              setNewSale({ ...newSale, date: e.target.value })
                            }
                            className="mt-2 rounded-2xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Pagamento</Label>
                          <Select
                            value={newSale.payment}
                            onValueChange={(value) =>
                              setNewSale({ ...newSale, payment: value })
                            }
                          >
                            <SelectTrigger className="mt-2 rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pix">Pix</SelectItem>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="Débito">Débito</SelectItem>
                              <SelectItem value="Crédito">Crédito</SelectItem>
                              <SelectItem value="Fiado">Fiado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Select
                            value={newSale.status}
                            onValueChange={(value) =>
                              setNewSale({ ...newSale, status: value })
                            }
                          >
                            <SelectTrigger className="mt-2 rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Recebido">Recebido</SelectItem>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button onClick={addSale} className="rounded-2xl">
                        Registrar venda
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="despesas">
                <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                  <Card className="rounded-2xl border-0 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>Despesas lançadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell>{expense.date}</TableCell>
                              <TableCell>{expense.category}</TableCell>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell>R$ {expense.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-0 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>Nova despesa</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div>
                        <Label>Categoria</Label>
                        <Input
                          value={newExpense.category}
                          onChange={(e) =>
                            setNewExpense({ ...newExpense, category: e.target.value })
                          }
                          className="mt-2 rounded-2xl"
                        />
                      </div>

                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={newExpense.description}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              description: e.target.value,
                            })
                          }
                          className="mt-2 rounded-2xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Valor</Label>
                          <Input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) =>
                              setNewExpense({ ...newExpense, amount: e.target.value })
                            }
                            className="mt-2 rounded-2xl"
                          />
                        </div>

                        <div>
                          <Label>Data</Label>
                          <Input
                            type="date"
                            value={newExpense.date}
                            onChange={(e) =>
                              setNewExpense({ ...newExpense, date: e.target.value })
                            }
                            className="mt-2 rounded-2xl"
                          />
                        </div>
                      </div>

                      <Button onClick={addExpense} className="rounded-2xl">
                        Salvar despesa
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
}