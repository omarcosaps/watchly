export const Attribution = () => {
  return (
    <footer className="border-t border-white/7 px-5 py-[22px] pb-[calc(1.75rem+var(--safe-bottom))] text-center text-[11.5px] text-white/35 sm:px-12">
      <p>
        Este produto usa a API do{" "}
        <a
          href="https://www.themoviedb.org/"
          className="text-[#c9d4e3] hover:text-white hover:underline"
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
          className="text-[#c9d4e3] hover:text-white hover:underline"
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
