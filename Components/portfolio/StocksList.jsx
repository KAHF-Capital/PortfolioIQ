import React, { useState } from "react";
import { Stock } from "@/entities/Stock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Building2, Trash2, Loader2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StocksList({ stocks, onStockUpdate }) {
  const [deletingId, setDeletingId] = useState(null);
  const [sortBy, setSortBy] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleDelete = async (stockId, symbol) => {
    setDeletingId(stockId);
    try {
      await Stock.delete(stockId);
      onStockUpdate();
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
    setDeletingId(null);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'symbol':
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case 'company':
        aValue = a.company_name || a.symbol;
        bValue = b.company_name || b.symbol;
        break;
      case 'shares':
        aValue = a.shares;
        bValue = b.shares;
        break;
      case 'cost_basis':
        aValue = a.purchase_price || 0;
        bValue = b.purchase_price || 0;
        break;
      case 'current_price':
        aValue = a.current_price || a.purchase_price || 0;
 
