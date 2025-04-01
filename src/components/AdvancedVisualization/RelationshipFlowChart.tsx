import React, { useState } from 'react';
import { ReconciliationResult } from '../../types';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'react-flow-renderer';
import { FileSpreadsheet, CreditCard, DollarSign, Building, PieChart } from 'lucide-react';

interface RelationshipFlowChartProps {
  results: ReconciliationResult[];
}

const NODE_TYPES = {
  invoice: 'invoice',
  payment: 'payment',
  ledger: 'ledger',
  customer: 'customer'
};

const NODE_COLORS = {
  invoice: '#10B981', // green
  payment: '#3B82F6', // blue
  ledger: '#8B5CF6', // purple
  customer: '#F59E0B', // orange
  error: '#EF4444' // red
};

const RelationshipFlowChart: React.FC<RelationshipFlowChartProps> = ({ results }) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  
  const customNodeStyles = {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '10px',
    width: 180,
    fontSize: '12px',
  };
  
  // Collect unique entities
  const extractEntities = () => {
    const customers = new Map();
    const invoices = new Map();
    const payments = new Map();
    const ledgerEntries = new Map();
    
    results.forEach(result => {
      // Add payment
      payments.set(result.payment.payment_id, {
        id: result.payment.payment_id,
        type: NODE_TYPES.payment,
        data: result.payment
      });
      
      // Add customer/payer
      customers.set(result.payment.payer_name, {
        id: result.payment.payer_name,
        type: NODE_TYPES.customer,
        data: { name: result.payment.payer_name }
      });
      
      // Add invoice if exists
      if (result.matchedInvoice) {
        invoices.set(result.matchedInvoice.invoice_id, {
          id: result.matchedInvoice.invoice_id,
          type: NODE_TYPES.invoice,
          data: result.matchedInvoice
        });
        
        // Add customer from invoice if different
        if (result.matchedInvoice.customer_name !== result.payment.payer_name) {
          customers.set(result.matchedInvoice.customer_name, {
            id: result.matchedInvoice.customer_name,
            type: NODE_TYPES.customer,
            data: { name: result.matchedInvoice.customer_name }
          });
        }
      }
      
      // Add ledger entry if exists
      if (result.ledgerEntry) {
        ledgerEntries.set(result.ledgerEntry.ledger_entry_id, {
          id: result.ledgerEntry.ledger_entry_id,
          type: NODE_TYPES.ledger,
          data: result.ledgerEntry
        });
      }
    });
    
    return {
      customers: Array.from(customers.values()),
      invoices: Array.from(invoices.values()),
      payments: Array.from(payments.values()),
      ledgerEntries: Array.from(ledgerEntries.values())
    };
  };
  
  // Create flow nodes and edges
  const createFlowElements = () => {
    const entities = extractEntities();
    
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    
    // Add customer nodes
    entities.customers.forEach((customer, index) => {
      nodes.push({
        id: customer.id,
        type: 'default',
        data: { 
          label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Building style={{ width: 16, height: 16, marginRight: 5 }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{customer.data.name}</div>
                <div style={{ fontSize: '10px' }}>Customer/Payer</div>
              </div>
            </div>
          )
        },
        position: { x: 50, y: 100 + index * 100 },
        style: { 
          ...customNodeStyles,
          backgroundColor: NODE_COLORS.customer + '20',
          borderColor: NODE_COLORS.customer,
        },
      });
    });
    
    // Add invoice nodes
    entities.invoices.forEach((invoice, index) => {
      nodes.push({
        id: invoice.id,
        type: 'default',
        data: { 
          label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FileSpreadsheet style={{ width: 16, height: 16, marginRight: 5 }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{invoice.id}</div>
                <div>${invoice.data.amount_due.toFixed(2)}</div>
                <div style={{ fontSize: '10px' }}>{invoice.data.due_date}</div>
              </div>
            </div>
          )
        },
        position: { x: 300, y: 50 + index * 120 },
        style: { 
          ...customNodeStyles,
          backgroundColor: NODE_COLORS.invoice + '20',
          borderColor: NODE_COLORS.invoice,
        },
      });
      
      // Add edge from customer to invoice
      edges.push({
        id: `${invoice.data.customer_name}-${invoice.id}`,
        source: invoice.data.customer_name,
        target: invoice.id,
        animated: false,
        style: { stroke: NODE_COLORS.invoice },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: NODE_COLORS.invoice,
        },
      });
    });
    
    // Add payment nodes
    entities.payments.forEach((payment, index) => {
      nodes.push({
        id: payment.id,
        type: 'default',
        data: { 
          label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CreditCard style={{ width: 16, height: 16, marginRight: 5 }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{payment.id}</div>
                <div>${payment.data.amount.toFixed(2)}</div>
                <div style={{ fontSize: '10px' }}>{payment.data.payment_date}</div>
              </div>
            </div>
          )
        },
        position: { x: 550, y: 50 + index * 120 },
        style: { 
          ...customNodeStyles,
          backgroundColor: NODE_COLORS.payment + '20',
          borderColor: NODE_COLORS.payment,
        },
      });
      
      // Add edge from customer to payment
      edges.push({
        id: `${payment.data.payer_name}-${payment.id}`,
        source: payment.data.payer_name,
        target: payment.id,
        animated: false,
        style: { stroke: NODE_COLORS.payment },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: NODE_COLORS.payment,
        },
      });
      
      // Add edge from payment to invoice if reference exists
      if (payment.data.reference_note) {
        const matchingInvoice = entities.invoices.find(inv => inv.id === payment.data.reference_note);
        if (matchingInvoice) {
          edges.push({
            id: `${payment.id}-${matchingInvoice.id}`,
            source: payment.id,
            target: matchingInvoice.id,
            animated: false,
            style: { stroke: NODE_COLORS.invoice, strokeDasharray: '5,5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: NODE_COLORS.invoice,
            },
          });
        }
      }
    });
    
    // Add ledger nodes
    entities.ledgerEntries.forEach((ledger, index) => {
      nodes.push({
        id: ledger.id,
        type: 'default',
        data: { 
          label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DollarSign style={{ width: 16, height: 16, marginRight: 5 }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{ledger.id}</div>
                <div>${ledger.data.amount.toFixed(2)}</div>
                <div style={{ fontSize: '10px' }}>{ledger.data.entry_date}</div>
              </div>
            </div>
          )
        },
        position: { x: 800, y: 50 + index * 120 },
        style: { 
          ...customNodeStyles,
          backgroundColor: NODE_COLORS.ledger + '20',
          borderColor: NODE_COLORS.ledger,
        },
      });
      
      // Add edges to invoice and payment
      if (ledger.data.invoice_id) {
        edges.push({
          id: `${ledger.id}-${ledger.data.invoice_id}`,
          source: ledger.id,
          target: ledger.data.invoice_id,
          animated: false,
          style: { stroke: NODE_COLORS.ledger, strokeDasharray: '5,5' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: NODE_COLORS.ledger,
          },
        });
      }
      
      if (ledger.data.payment_id) {
        edges.push({
          id: `${ledger.id}-${ledger.data.payment_id}`,
          source: ledger.id,
          target: ledger.data.payment_id,
          animated: false,
          style: { stroke: NODE_COLORS.ledger, strokeDasharray: '5,5' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: NODE_COLORS.ledger,
          },
        });
      }
    });
    
    // Add error edges for problematic reconciliations
    results.forEach(result => {
      if (result.issues.length > 0) {
        const paymentId = result.payment.payment_id;
        
        result.issues.forEach((issue, idx) => {
          if (issue.type === 'duplicate_payment' && 'duplicatePayment' in issue) {
            const duplicateId = issue.duplicatePayment.payment_id;
            edges.push({
              id: `error-${paymentId}-${duplicateId}-${idx}`,
              source: paymentId,
              target: duplicateId,
              animated: true,
              style: { stroke: NODE_COLORS.error, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: NODE_COLORS.error,
              },
              label: 'DUPLICATE',
              labelStyle: { fill: NODE_COLORS.error, fontWeight: 700 }
            });
          }
          
          if (issue.type === 'amount_mismatch' && result.matchedInvoice) {
            const invoiceId = result.matchedInvoice.invoice_id;
            edges.push({
              id: `error-${paymentId}-${invoiceId}-${idx}`,
              source: paymentId,
              target: invoiceId,
              animated: true,
              style: { stroke: NODE_COLORS.error, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: NODE_COLORS.error,
              },
              label: 'MISMATCH',
              labelStyle: { fill: NODE_COLORS.error, fontWeight: 700 }
            });
          }
        });
      }
    });
    
    return { nodes, edges };
  };
  
  const { nodes: initialNodes, edges: initialEdges } = createFlowElements();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedEntity(node.id);
  };
  
  const onPaneClick = () => {
    setSelectedEntity(null);
  };
  
  return (
    <div className="w-full h-[400px] bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
        <div className="flex items-center">
          <PieChart className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Financial Relationship Flow</h3>
        </div>
        <div className="flex space-x-2">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
            <CreditCard className="h-3 w-3 mr-1" /> Payments
          </span>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
            <FileSpreadsheet className="h-3 w-3 mr-1" /> Invoices
          </span>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center">
            <DollarSign className="h-3 w-3 mr-1" /> Ledger
          </span>
        </div>
      </div>
      
      <div className="h-[350px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <Background color="#f5f5f5" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default RelationshipFlowChart;