import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Hook centralizado para estadísticas de inventario.
 * Evita cálculos duplicados en Dashboard, ProductosPage, StockDashboard y ReportesDashboard.
 */
export function useStockStats() {
  const { productos = [], dashData } = useApp();

  return useMemo(() => {
    // Fallback: calcular desde productos locales
    const totalProductos = productos.length;
    const totalStock = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
    const valorTotalInventario = productos.reduce(
      (sum, p) => sum + (p.precio || 0) * (p.stock || 0),
      0
    );
    const productosBajoStock = productos.filter(p => p.stock <= (p.stockMinimo || 5));
    const productosStockCritico = productosBajoStock.length;
    const healthPercent = totalProductos > 0
      ? Math.round(((totalProductos - productosStockCritico) / totalProductos) * 100)
      : 100;

    // Si tenemos datos del backend, úsalos pero conserva healthPercent calculado localmente
    if (dashData) {
      const critBackend = dashData.productosStockCritico ?? productosStockCritico;
      const totBackend  = dashData.totalProductos ?? totalProductos;
      const healthPercentBackend = totBackend > 0
        ? Math.round(((totBackend - critBackend) / totBackend) * 100)
        : 100;
      return {
        totalProductos:      dashData.totalProductos      ?? 0,
        totalStock:          dashData.totalStock          ?? 0,
        valorTotalInventario: dashData.valorTotalInventario ?? 0,
        productosStockCritico: critBackend,
        productosBajoStock:  dashData.productosBajoStock  ?? [],
        pedidosPendientes:   dashData.pedidosPendientes   ?? 0,
        ultimosMovimientos:  dashData.ultimosMovimientos  ?? [],
        healthPercent:       healthPercentBackend,
      };
    }

    return {
      totalProductos,
      totalStock,
      valorTotalInventario,
      productosStockCritico,
      productosBajoStock,
      pedidosPendientes: 0,
      ultimosMovimientos: [],
      healthPercent,
    };
  }, [productos, dashData]);
}
