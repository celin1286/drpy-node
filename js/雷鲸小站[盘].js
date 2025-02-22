const {req_, req_proxy} = $.require('./_lib.request.js')
const {
    formatPlayUrl,
} = misc;
var rule = {
    title: '雷鲸小站[盘]',
    host: 'https://www.leijing1.xyz',
    url: '/?tagId=fyclass&page=fypage',
    detailUrl: '/fyid',
    searchUrl: '/search/keyword/**?page=fypage',  // 修改搜索URL格式
    play_parse: true,
    class_parse: async () => {
        let classes = [{
            type_id: '42204681950354',
            type_name: '电影',
        }, {
            type_id: '42204684250355',
            type_name: '剧集',
        }, {
            type_id: '42212287587456',
            type_name: '影视原盘',
        }, {
            type_id: '42204697150356',
            type_name: '记录',
        }, {
            type_id: '42204792950357',
            type_name: '动画动漫',
        }, {
            type_id: '42210356650363',
            type_name: " 综艺"
        }
        ];
        return {
            class: classes,
        }
    },
    预处理: async () => {
        // await Quark.initQuark()
        return []
    },
    推荐: async () => {
        return []
    },
    一级: async function (tid, pg, filter, extend) {
        let {MY_CATE, input} = this;
        let html = await req_(input, 'get', {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        })
        const $ = pq(html)
        let videos = []
        $('.topicList .topicItem').each((index, item) => {
            const a = $(item).find('h2 a:first')[0];
            videos.push({
                "vod_name": a.children[0].data,
                "vod_id": a.attribs.href,
                "vod_pic": ''
            })
        })
        return videos
    },
    二级: async function (ids) {
        let {input} = this;
        let html = await req_(input, 'get', {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        })
        const $ = pq(html)
        let vod = {
            "vod_name": $('.title').text().trim(),
            "vod_id": input,
            "vod_content": $('div.topicContent p:nth-child(1)').text()
        }
        let content_html = $('.topicContent').html()
        let link = content_html.match(/<a\s+(?:[^>]*?\s+)?href=["'](https:\/\/cloud\.189\.cn\/[^"']*)["'][^>]*>/gi);
        if (!link || link.length === 0) {
            // 如果 a 标签匹配不到，尝试匹配 span 标签中的文本内容
            link = content_html.match(/<span\s+style="color:\s*#0070C0;\s*">https:\/\/cloud\.189\.cn\/[^<]*<\/span>/gi);
            if (link && link.length > 0) {
                // 提取 span 标签中的 URL
                link = link[0].match(/https:\/\/cloud\.189\.cn\/[^<]*/)[0];
            } else {
                link = content_html.match(/https:\/\/cloud\.189\.cn\/[^<]*/)[0]
            }
        } else {
            // 提取 a 标签中的 URL
            link = link[0].match(/https:\/\/cloud\.189\.cn\/[^"']*/)[0];
        }
        let playform = []
        let playurls = []
        let playPans = [];
        if (/cloud.189.cn/.test(link)) {
            playPans.push(link);
            let data = await Cloud.getShareData(link)
            Object.keys(data).forEach(it => {
                playform.push('Cloud-' + it)
                const urls = data[it].map(item => item.name + "$" + [item.fileId, item.shareId].join('*')).join('#');
                playurls.push(urls);
            })
        }
        vod.vod_play_from = playform.join("$$$")
        vod.vod_play_url = playurls.join("$$$")
        vod.vod_play_pan = playPans.join("$$$")
        return vod
    },
    搜索: async function (wd, quick, pg) {
        let {input} = this;
        let d = [];
        try {
            // 添加调试日志
            console.log('搜索URL:', input);
            
            let html = await req_(input, 'get', {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
            });
            
            // 添加调试日志
            console.log('搜索返回HTML:', html.substring(0, 200));
            
            const $ = pq(html);
            
            // 检查页面结构
            let items = $('.topicList .topicItem');
            console.log('找到搜索结果数量:', items.length);
            
            items.each((index, item) => {
                const a = $(item).find('h2 a:first')[0];
                if (a && a.children && a.children[0]) {
                    d.push({
                        vod_name: a.children[0].data,
                        vod_id: a.attribs.href,
                        vod_remarks: '',
                        vod_pic: '',
                        vod_content: $(item).find('.topicContent').text().trim()
                    });
                }
            });
            
            // 如果没有找到结果，尝试其他选择器
            if (d.length === 0) {
                $('.search-results .item').each((index, item) => {
                    const title = $(item).find('.title').text().trim();
                    const url = $(item).find('a').attr('href');
                    if (title && url) {
                        d.push({
                            vod_name: title,
                            vod_id: url,
                            vod_remarks: '',
                            vod_pic: '',
                            vod_content: $(item).find('.content').text().trim()
                        });
                    }
                });
            }
        } catch (e) {
            console.log('搜索发生错误:', e.message);
        }
        
        // 打印最终结果
        console.log('搜索结果数量:', d.length);
        return d;
    },
    lazy: async function (flag, id, flags) {
        let {getProxyUrl, input} = this;
        const ids = input.split('*');
        if (flag.startsWith('Cloud-')) {
            log("天翼云盘解析开始")
            const url = await Cloud.getShareUrl(ids[0], ids[1]);
            return {
                url: url + "#isVideo=true#",
            }
        }
    },
}
