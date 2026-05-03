import { defineConfig } from 'vitepress'

const guide = [
  { text: '首页', link: '/' },
  { text: 'Part I. 目标', link: '/part-1-goal' },
  { text: '第 1 章 句子骨架', link: '/ch1-sentence-skeleton' },
  { text: '第 2 章 主谓一致', link: '/ch2-subject-verb-agreement' },
  { text: '第 3 章 三类致命句子错误', link: '/ch3-sentence-errors' },
  { text: '第 4 章 并列', link: '/ch4-coordination' },
  { text: '第 5 章 从属', link: '/ch5-subordination' },
  { text: '第 6 章 标点符号', link: '/ch6-punctuation' },
  { text: '第 7 章 卷面规范', link: '/ch7-mechanics' },
  { text: 'Part III. 把知识组装起来', link: '/part-3-building' },
  { text: '附录 A. 常见失误速查总表', link: '/appendix-a-common-errors' },
  { text: '附录 B. 术语对照与知识点速查表', link: '/glossary' }
]

export default defineConfig({
  title: '英语写作长句教程',
  description: '面向大学英语写作的长句结构、标点与卷面规范教程',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: false,
  markdown: {
    config(md) {
      const defaultHeadingOpen =
        md.renderer.rules.heading_open ||
        ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

      md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
        const html = defaultHeadingOpen(tokens, idx, options, env, self)
        const next = tokens[idx + 1]
        if (!next || next.type !== 'inline') return html

        const match = next.content.match(/^([A-Za-z])(\d+)\.(\d+)\b/)
        if (!match) return html

        const alias = `${match[1].toLowerCase()}${match[2]}-${match[3]}`
        return `${html}<span id="${alias}" class="heading-alias" aria-hidden="true"></span>`
      }
    }
  },
  themeConfig: {
    logo: null,
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除搜索',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '速查表', link: '/appendix-a-common-errors' },
      { text: '术语表', link: '/glossary' }
    ],
    sidebar: [
      {
        text: '英语写作长句教程',
        items: guide
      }
    ],
    docFooter: {
      prev: '上一章',
      next: '下一章'
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '语言',
    skipToContentLabel: '跳到正文'
  },
  vite: {
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
})
