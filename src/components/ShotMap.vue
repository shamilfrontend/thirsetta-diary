<template>
  <figure class="shot-map">
    <svg class="shot-map__figure" viewBox="10 0 124 204" aria-hidden="true">
      <g class="shot-map__body">
        <path d="M58 118c-6 4-8 22-8 44l-1 28c0 8 14 8 14 0l2-34c1-16 1-28 4-38h-11z" />
        <path d="M82 118c6 4 8 22 8 44l1 28c0 8-14 8-14 0l-2-34c-1-16-1-28-4-38h11z" />
        <path d="M48 54c-16 6-28 24-28 46 0 16 4 26 12 26 6 0 10-8 8-20-2-16 2-30 10-40 2-8 2-16-2-12z" />
        <path d="M92 54c16 6 28 24 28 46 0 16-4 26-12 26-6 0-10-8-8-20 2-16-2-30-10-40-2-8-2-16 2-12z" />
        <path d="M50 56c0-12 8-16 20-16s20 4 20 16l4 24c2 20-4 40-12 50l-4 10H62l-4-10c-8-10-14-30-12-50z" />
        <rect x="63" y="30" width="14" height="18" rx="6" />
        <circle cx="70" cy="20" r="13" />
      </g>
      <g class="shot-map__mark">
        <ellipse cx="70" cy="98" rx="14" ry="11" />
        <circle cx="70" cy="98" r="8" />
        <text x="70" y="101.5">1</text>
      </g>
      <g class="shot-map__mark">
        <ellipse cx="84" cy="150" rx="9" ry="14" />
        <circle cx="84" cy="150" r="8" />
        <text x="84" y="153.5">2</text>
      </g>
      <g class="shot-map__mark">
        <ellipse cx="108" cy="78" rx="10" ry="12" />
        <circle cx="108" cy="78" r="8" />
        <text x="108" y="81.5">3</text>
      </g>
    </svg>
    <figcaption>
      <ol class="shot-map__legend">
        <li>
          <span class="nums">1</span>
          <span>
            <strong>Живот</strong>
          </span>
        </li>
        <li>
          <span class="nums">2</span>
          <span>
            <strong>Бедро</strong>
            <span class="muted">спереди или снаружи</span>
          </span>
        </li>
        <li>
          <span class="nums">3</span>
          <span>
            <strong>Плечо</strong>
            <span class="muted">верхняя часть</span>
          </span>
        </li>
      </ol>
    </figcaption>
  </figure>
</template>
