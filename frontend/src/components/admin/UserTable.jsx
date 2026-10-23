import React from 'react';
import { FiEdit2, FiTrash2, FiShield, FiUser, FiShoppingBag } from 'react-icons/fi';

const UserTable = ({ users, currentUserId, onEdit, onDelete }) => {
  return (
    <div>
      {/* Mobile Card List (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const isAdmin = user.role === 'ADMIN';
          const orderCount = user._count?.orders ?? 0;
          const registeredDate = user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '-';

          return (
            <div
              key={user.id}
              className="bg-surface p-4 rounded-lg border border-brand-border/20 shadow-soft flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xs ${
                      isAdmin
                        ? 'bg-brand text-content border border-mauve/40'
                        : 'bg-surface-elevated text-content-secondary border border-brand-border/25'
                    }`}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-medium text-content leading-tight">
                        {user.name}
                      </h4>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-surface-elevated text-mauve font-medium px-1.5 py-0.5 rounded border border-brand-border/25">
                          Vos
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-content-muted mt-0.5">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-content-secondary mt-0.5 font-mono">
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-brand text-content border border-mauve/40'
                      : 'bg-surface-elevated text-content-secondary border border-brand-border/25'
                  }`}
                >
                  {isAdmin ? (
                    <FiShield className="text-[10px]" />
                  ) : (
                    <FiUser className="text-[10px]" />
                  )}
                  <span>{isAdmin ? 'Admin' : 'Cliente'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-brand-border/15 text-xs">
                <div className="flex items-center space-x-3 text-content-muted">
                  <span className="flex items-center space-x-1">
                    <FiShoppingBag className="text-mauve" />
                    <span>{orderCount} pedidos</span>
                  </span>
                  <span>&bull;</span>
                  <span>Reg: {registeredDate}</span>
                </div>

                <div className="flex space-x-1.5">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1.5 bg-surface-elevated hover:bg-brand text-content rounded transition-colors border border-brand-border/25"
                    title="Modificar usuario y rol"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    disabled={isCurrentUser}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Estás seguro de que querés eliminar al usuario ${user.name} (${user.email})?`
                        )
                      ) {
                        onDelete(user.id, user.name);
                      }
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      isCurrentUser
                        ? 'opacity-30 cursor-not-allowed text-content-muted bg-canvas'
                        : 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40'
                    }`}
                    title={
                      isCurrentUser ? 'No podés eliminar tu propia cuenta' : 'Eliminar usuario'
                    }
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Data Table (screens >= 768px) */}
      <div className="hidden md:block bg-surface rounded-lg border border-brand-border/20 overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border/20 text-left">
          <thead className="bg-surface-elevated/60 text-[11px] font-medium text-content-secondary uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Usuario</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Pedidos</th>
              <th className="px-5 py-3">Fecha Registro</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/15 text-xs">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isAdmin = user.role === 'ADMIN';
              const orderCount = user._count?.orders ?? 0;
              const registeredDate = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '-';

              return (
                <tr key={user.id} className="hover:bg-surface-elevated/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${
                          isAdmin
                            ? 'bg-brand text-content border border-mauve/40'
                            : 'bg-surface-elevated text-content-secondary border border-brand-border/25'
                        }`}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-medium text-content">{user.name}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-surface-elevated text-mauve font-medium px-1.5 py-0.5 rounded border border-brand-border/25">
                              Vos
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-content-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-content-secondary">
                    {user.phone || '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-brand text-content border border-mauve/40'
                          : 'bg-surface-elevated text-content-secondary border border-brand-border/25'
                      }`}
                    >
                      {isAdmin ? (
                        <FiShield className="text-[10px]" />
                      ) : (
                        <FiUser className="text-[10px]" />
                      )}
                      <span>{isAdmin ? 'Admin' : 'Cliente'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-content-secondary">
                    {orderCount}
                  </td>
                  <td className="px-5 py-3.5 text-content-muted">{registeredDate}</td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-content-secondary hover:text-content p-1"
                      title="Editar usuario"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      disabled={isCurrentUser}
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Estás seguro de que querés eliminar al usuario ${user.name}?`
                          )
                        ) {
                          onDelete(user.id, user.name);
                        }
                      }}
                      className={`p-1 ${
                        isCurrentUser
                          ? 'opacity-20 cursor-not-allowed text-content-muted'
                          : 'text-content-muted hover:text-rose-400'
                      }`}
                      title={
                        isCurrentUser ? 'No podés eliminar tu propia cuenta' : 'Eliminar usuario'
                      }
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
