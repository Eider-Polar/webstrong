import React from 'react';
import Modal from './Modal';
import { HiPrinter, HiShare } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

/**
 * Modal de Ticket de Venta POS para STRONG GYM
 */
const ModalTicketPOS = ({ isOpen, onClose, ventaData }) => {
  if (!isOpen || !ventaData) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  const detalles = ventaData.detalles || ventaData.items || [];
  const fechaStr = ventaData.fecha || ventaData.created_at || new Date().toLocaleString('es-CO');
  const ticketId = ventaData.id
    ? `POS-${String(ventaData.id).padStart(5, '0')}`
    : `POS-${Date.now().toString().slice(-5)}`;
  const clienteNombre = ventaData.clienteNombre || ventaData.client?.name || 'Cliente Mostrador';
  const totalVenta = ventaData.total || ventaData.total_cop || 0;
  const vendedor = ventaData.vendedor || ventaData.seller?.name || 'Recepción';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let msg = `🏋️‍♂️ *COMPROBANTE DE COMPRA - STRONG GYM*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🧾 *N° Ticket:* ${ticketId}\n`;
    msg += `📅 *Fecha:* ${fechaStr}\n`;
    msg += `👤 *Cliente:* ${clienteNombre}\n`;
    msg += `💼 *Atendido por:* ${vendedor}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*DETALLE DE PRODUCTOS:*\n`;

    detalles.forEach((det, idx) => {
      const pNom = det.nombre || det.productoNombre || det.name || 'Producto';
      const cant = det.cantidad || det.quantity || 1;
      const sub = det.subtotal || (det.precio_unitario || det.price || 0) * cant;
      msg += `${idx + 1}. ${pNom} (x${cant}) ➔ ${formatCurrency(sub)}\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *TOTAL PAGADO:* ${formatCurrency(totalVenta)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💪 _¡Gracias por entrenar con nosotros en STRONG GYM!_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Comprobante de Venta"
      subtitle={`Ticket ${ticketId}`}
      badge="Punto de Venta POS"
      badgeColor="emerald"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <HiPrinter className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Contenedor estilo Ticket térmico */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-mono text-xs text-slate-800 space-y-4 print:p-0 print:border-none">
        {/* Cabecera Ticket */}
        <div className="text-center border-b border-slate-200/80 pb-3">
          <h2 className="text-base font-black tracking-tight text-slate-900">
            STRONG GYM
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
            Fitness Center & Suplementación
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Ticket: <span className="font-bold text-slate-700">{ticketId}</span>
          </p>
          <p className="text-[11px] text-slate-400">Fecha: {fechaStr}</p>
          <p className="text-[11px] text-slate-400">
            Cliente: <span className="font-bold text-slate-700">{clienteNombre}</span>
          </p>
        </div>

        {/* Tabla de Items */}
        <div className="space-y-2 border-b border-slate-200/80 pb-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Cant / Producto</span>
            <span>Subtotal</span>
          </div>

          {detalles.map((det, idx) => {
            const pNom = det.nombre || det.productoNombre || det.name || 'Producto';
            const cant = det.cantidad || det.quantity || 1;
            const sub = det.subtotal || (det.precio_unitario || det.price || 0) * cant;

            return (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">x{cant}</span>{' '}
                  <span className="text-slate-700">{pNom}</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(sub)}</span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center text-sm pt-1">
          <span className="font-bold text-slate-600">TOTAL:</span>
          <span className="text-lg font-black text-slate-900">
            {formatCurrency(totalVenta)}
          </span>
        </div>

        {/* Pie de Ticket */}
        <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
          <p>¡Gracias por tu compra!</p>
          <p className="mt-0.5">STRONG GYM • Tu mejor versión</p>
        </div>
      </div>
    </Modal>
  );
};

export default ModalTicketPOS;
