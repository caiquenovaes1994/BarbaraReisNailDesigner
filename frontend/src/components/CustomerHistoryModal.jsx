import { X } from 'lucide-react';

const CustomerHistoryModal = ({ isOpen, onClose, customer, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      <div className="glass-panel p-6 sm:p-8 w-full max-w-3xl relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          title="Fechar"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-semibold border-b border-surface-border pb-4 mb-6">
          Histórico de Atendimentos: {customer?.nome}
        </h3>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {(!history || history.length === 0) ? (
            <p className="text-gray-400 text-center py-8">Nenhum atendimento registrado.</p>
          ) : (
            <table className="glass-table w-full">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Procedimento</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {history.map(appt => {
                  const dateObj = new Date(appt.data_atendimento);
                  return (
                    <tr key={appt.id}>
                      <td>{dateObj.toLocaleDateString('pt-BR')}</td>
                      <td>{dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{appt.procedure?.nome}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-medium border
                          ${appt.status === 'Atendido' ? 'bg-green-500/20 text-green-400' : 
                            appt.status === 'Agendado' ? 'bg-yellow-500/20 text-yellow-400' : 
                            'bg-red-500/20 text-red-400'}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appt.valor_cobrado)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;
