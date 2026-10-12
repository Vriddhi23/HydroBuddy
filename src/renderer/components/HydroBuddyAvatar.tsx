import { useId } from 'react'
import { clothingColors, bottleColors, type AvatarAppearance } from '../../shared/preferences'
export type AnimationState = 'idle' | 'walking' | 'waving' | 'happy' | 'celebrating' | 'sad' | 'exiting'
export type Expression = 'normal' | 'happy' | 'excited' | 'sad'
export function HydroBuddyAvatar({ appearance, animationState = 'idle', expression = 'normal' }: { appearance: AvatarAppearance; animationState?: AnimationState; expression?: Expression }) {
  const id = useId().replaceAll(':','')
  const shirt = clothingColors[appearance.clothingColor], bottle = bottleColors[appearance.bottleColor]
  const female = appearance.gender === 'female'
  return <svg className={`avatar avatar--${animationState}`} viewBox="0 0 240 340" role="img" aria-label={`${appearance.gender} HydroBuddy with ${appearance.clothingColor} clothing and a ${appearance.bottleColor} bottle`}>
    <defs><linearGradient id={`${id}shirt`} x2="0.8" y2="1"><stop stopColor={shirt}/><stop offset="1" stopColor={shirt} stopOpacity=".78"/></linearGradient><linearGradient id={`${id}skin`} x2=".8" y2="1"><stop stopColor="#f9d3ab"/><stop offset="1" stopColor="#eeb185"/></linearGradient></defs>
    <ellipse className="avatar-shadow" cx="123" cy="321" rx="58" ry="10" fill="#344952" opacity=".12"/>
    <g className="avatar-body" stroke="#343947" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      {female && <path d="M66 96Q46 36 93 25Q150 1 174 49Q190 74 176 121Q198 169 171 192L62 183Q45 158 62 128Z" fill="#302d32"/>}
      <g className="leg leg-left"><path d="M86 218L118 219L113 292Q101 301 85 290Z" fill="#8eaec3"/><path d="M85 287L113 290L114 308Q104 317 72 312Q66 298 85 287Z" fill="#fffdf8"/><path d="M73 307L113 307M87 299L98 301" fill="none"/></g>
      <g className="leg leg-right"><path d="M122 220L155 216L157 290Q140 300 128 291Z" fill="#a0bdd0"/><path d="M128 291L156 288Q178 300 170 312Q143 316 128 308Z" fill="#fffdf8"/><path d="M130 307L170 307M143 300L154 298" fill="none"/></g>
      <path d="M84 207L157 207L156 236L127 239L120 231L112 239L84 236Z" fill="#9cb9cd"/><path d="M121 214V230M86 224Q101 226 102 213M153 225Q139 226 139 214" fill="none" opacity=".5"/>
      <g className="arm arm-bottle"><path d="M83 151Q67 151 60 176L44 160L34 172Q55 216 73 200L93 172Z" fill={`url(#${id}skin)`}/><path d="M86 144Q70 141 60 168L79 179L94 162Z" fill={shirt}/>
        <g transform="rotate(-12 45 158)"><rect x="22" y="125" width="33" height="64" rx="10" fill={bottle}/><path d="M28 151Q38 145 49 151V177Q36 181 28 177Z" fill="#fff" opacity=".3" stroke="none"/><rect x="25" y="116" width="27" height="13" rx="4" fill={bottle}/><path d="M32 116V110Q43 103 47 116M29 134V141" fill="none"/><path d="M38 151Q25 166 38 169Q51 166 38 151Z" fill="#e7faff" strokeWidth="1.5"/></g><path d="M29 158Q19 151 20 158L23 172Q28 179 34 174" fill={`url(#${id}skin)`}/>
      </g>
      <g className="arm arm-free"><path d="M152 154Q174 165 176 201L172 226Q166 237 160 228L159 200L141 169Z" fill={`url(#${id}skin)`}/><path d="M147 142Q168 143 174 168L154 179L141 161Z" fill={shirt}/><path d="M166 216V228" fill="none" strokeWidth="1.5"/></g>
      <path d="M100 138Q120 133 140 138L152 151L158 208Q128 222 82 208L87 152Z" fill={`url(#${id}shirt)`}/><path d="M105 134L105 146Q121 158 136 145L136 131" fill={`url(#${id}skin)`}/><path d="M98 145Q120 163 142 145" fill="none" stroke="#fff" opacity=".6"/><path d="M111 181Q121 167 129 181Q135 194 121 196Q107 194 111 181Z" fill="#fff" stroke="none" opacity=".72"/>
      <g className="avatar-head"><ellipse cx="75" cy="91" rx="9" ry="14" fill="#efb88d"/><ellipse cx="166" cy="91" rx="9" ry="14" fill="#efb88d"/>
        <path d="M75 70Q75 30 120 29Q166 30 166 71L164 103Q153 139 120 141Q87 137 77 107Z" fill={`url(#${id}skin)`}/>
        {female ? <path d="M70 95Q58 61 79 37Q107 9 137 26Q176 23 173 78L164 101Q164 62 134 47Q111 63 83 62L78 100Z" fill="#302d32"/> : <path d="M73 88Q59 65 74 43L67 35L88 37Q108 15 137 25Q172 26 170 62L164 87L154 61Q120 76 90 58L80 90Z" fill="#302d32"/>}
        <path d="M83 48Q104 27 130 34" stroke="#575057" fill="none" strokeWidth="4"/>
        <path d={expression === 'sad' ? 'M91 81L106 76M136 76L151 81' : 'M91 78Q99 73 106 78M135 78Q144 73 151 78'} fill="none" strokeWidth="3"/>
        {expression === 'excited' ? <path d="M92 94Q100 81 108 94M134 94Q142 81 150 94" fill="none" strokeWidth="3"/> : <g><ellipse cx="101" cy="92" rx="5" ry="7" fill="#30333c"/><ellipse cx="142" cy="92" rx="5" ry="7" fill="#30333c"/><circle cx="103" cy="90" r="1.5" fill="white" stroke="none"/><circle cx="144" cy="90" r="1.5" fill="white" stroke="none"/></g>}
        <ellipse cx="91" cy="105" rx="10" ry="5" fill="#e79086" opacity=".45" stroke="none"/><ellipse cx="152" cy="105" rx="10" ry="5" fill="#e79086" opacity=".45" stroke="none"/>
        <path d="M121 94L117 105L123 106" stroke="#ca946e" fill="none" strokeWidth="1.8"/>
        {expression === 'sad' ? <path d="M110 119Q120 111 132 119" fill="none"/> : <g><path d="M105 114Q121 123 139 113Q127 139 111 123Z" fill="#693c42"/><path d="M108 116Q122 123 135 116" stroke="white" strokeWidth="4"/></g>}
        {female && <g fill="#e9bf63" stroke="#b28b3b" strokeWidth="1.4"><circle cx="77" cy="110" r="4"/><circle cx="166" cy="110" r="4"/></g>}
      </g>
    </g>
  </svg>
}
