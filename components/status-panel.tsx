type StatusPanelProps = {
  title: string
  message: string
  action?: React.ReactNode
}

export const StatusPanel = ({ title, message, action }: StatusPanelProps) => {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h2 className="font-display text-4xl italic tracking-tight text-paper">{title}</h2>
      <p className="mt-3 text-mist">{message}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  )
}
