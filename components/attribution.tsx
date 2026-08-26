export const Attribution = () => {
  return (
    <footer className="relative z-10 mt-auto px-4 py-8 text-center text-xs text-mist">
      <p>
        Este produto usa a API do{" "}
        <a
          href="https://www.themoviedb.org/"
          className="text-paper/80 underline-offset-2 hover:text-paper hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          TMDB
        </a>
        , mas não é endossado ou certificado pelo TMDB.
      </p>
      <p className="mt-1">
        Disponibilidade de streaming via{" "}
        <a
          href="https://www.justwatch.com/"
          className="text-paper/80 underline-offset-2 hover:text-paper hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          JustWatch
        </a>
        .
      </p>
    </footer>
  )
}
