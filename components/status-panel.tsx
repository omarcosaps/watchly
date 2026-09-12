type StatusPanelProps = {
  title: string
  message: string
  action?: React.ReactNode
}

export const StatusPanel = ({ title, message, action }: StatusPanelProps) => {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h2 className="text-[20px] font-extrabold tracking-[-0.02em] text-paper">{title}</h2>
      <p className="mt-3 text-[14.5px] text-white/50">{message}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  )
}
