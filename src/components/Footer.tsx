export const Footer = () => (
  <footer>
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img
              src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
              alt="Oqyrman"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-primary">Oqyrman</span>
          </div>
          <p className="text-sm text-muted-foreground">Цифровая библиотека Казахстана</p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4">Навигация</h4>
          <div className="flex flex-col gap-2">
            {[
              { label: "Каталог", href: "#books" },
              { label: "Библиотеки", href: "#libraries" },
              { label: "О нас", href: "#features" },
            ].map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-4">Разработчикам</h4>
          <a
            href="https://api.oqyrman.app/swagger/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            API Docs
          </a>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
        © 2026 Oqyrman. Все права защищены.
      </div>
    </div>
    <div className="h-1 bg-primary" />
  </footer>
);
