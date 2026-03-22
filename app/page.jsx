"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

function analyzeMessage(recipient, message) {
  const text = message.trim();
  const who = recipient.trim();

  if (!text) {
    return {
      score: 0,
      level: "未判定",
      reasons: [],
      suggestion: "",
      rewrite: "",
      sendAdvice: "まずは相手と文面を入れてみてください。",
    };
  }

  let score = 8;
  const reasons = [];

  const hasQuestionPressure = /(なんで|どうして|なぜ|返信くれない|返事くれない|返して)/.test(text);
  const hasBlame = /(もういい|最悪|信じられない|ありえない|無視|ひどい)/.test(text);
  const hasUltimatum = /(別れよう|終わりにしよう|もう会わない|もう連絡しない)/.test(text);
  const hasEmotionalBurst = /[!！]{2,}|[?？]{2,}|。{2,}|\.{3,}/.test(text);
  const hasLateNightTone = /(今すぐ|今日中|すぐ返事|今から|いまから)/.test(text);
  const hasVulnerability = /(寂しい|会いたい|つらい|悲しい|しんどい)/.test(text);
  const isLong = text.length > 90;
  const isBoss = /(上司|先輩|部長|課長|社長)/.test(who);
  const isPartner = /(恋人|彼氏|彼女|パートナー|好きな人)/.test(who);
  const isFriend = /(友達|親友|友人)/.test(who);
  const isGroup = /(グループ|みんな|チーム)/.test(who);

  if (hasQuestionPressure) {
    score += 18;
    reasons.push("相手に返答を迫る圧が強く見えやすいです。");
  }
  if (hasBlame) {
    score += 20;
    reasons.push("責めている印象を与えやすい表現が入っています。");
  }
  if (hasUltimatum) {
    score += 28;
    reasons.push("勢いで送ると関係を大きく動かしやすい言い切りがあります。");
  }
  if (hasEmotionalBurst) {
    score += 12;
    reasons.push("感情の強さが記号に出ていて、きつく受け取られやすいです。");
  }
  if (hasLateNightTone) {
    score += 12;
    reasons.push("今すぐ反応を求めるニュアンスがあります。");
  }
  if (hasVulnerability) {
    score += 8;
    reasons.push("本音は大事ですが、深夜だと重く伝わる可能性があります。");
  }
  if (isLong) {
    score += 8;
    reasons.push("文章が長く、感情の意図がぶれて伝わるかもしれません。");
  }
  if (isBoss) {
    score += 10;
    reasons.push("相手が上司・目上の人だと、勢いのある文面はリスクが上がります。");
  }
  if (isPartner) {
    score += 10;
    reasons.push("恋人相手は感情が誤解されやすく、後悔しやすい相手です。");
  }
  if (isFriend) {
    score += 4;
    reasons.push("友達相手でも、深夜の強い文面は誤解を生みやすいです。");
  }
  if (isGroup) {
    score += 6;
    reasons.push("グループ宛ては一度送ると取り返しがつきにくいです。");
  }

  score = Math.min(score, 100);

  let level = "低";
  let sendAdvice = "今のままでも比較的安全ですが、少しだけ整えるとより伝わりやすいです。";

  if (score >= 70) {
    level = "高";
    sendAdvice = "今は送らず、ちょっと保留がおすすめです。";
  } else if (score >= 40) {
    level = "中";
    sendAdvice = "少し整えてから送ると、誤解や後悔を減らしやすいです。";
  }

  const suggestion = getFriendlyGuidance(text, score, who);
  const rewrite = rewriteMessage(text, score, who);

  if (reasons.length === 0) {
    reasons.push("強い責めや断定は少なく、比較的落ち着いた文面です。");
  }

  return { score, level, reasons, suggestion, rewrite, sendAdvice };
}

function getFriendlyGuidance(text, score, recipient) {
  if (score >= 70) {
    if (/(上司|先輩|部長|課長|社長)/.test(recipient)) {
      return "相手が上司・目上の人なので、今夜の勢いは特に危険です。伝えたい要点だけ残して、朝に見返すのがおすすめです。";
    }
    return "今の文面は“本音”より“勢い”が前に出ています。伝えたいことを1つに絞って、今夜は保存だけでも十分です。";
  }
  if (score >= 40) {
    return "気持ちは伝わりますが、そのままだと重さや責める印象が先に届くかもしれません。短く、やわらかくすると伝わり方が変わります。";
  }
  if (/(寂しい|会いたい|つらい)/.test(text)) {
    return "素直さは残しつつ、相手に負担がかかりすぎない形に整えるのがおすすめです。";
  }
  return "比較的落ち着いています。必要なら少しだけ短くして、読みやすさを上げるとさらに良いです。";
}

function rewriteMessage(text, score, recipient) {
  const compact = text.replace(/\s+/g, " ").trim();
  const isBoss = /(上司|先輩|部長|課長|社長)/.test(recipient);
  const isPartner = /(恋人|彼氏|彼女|パートナー|好きな人)/.test(recipient);

  if (score >= 70) {
    if (isBoss) {
      return "夜分に失礼します。感情的なまま送るのを避けたいので、必要なことは明日改めて整理してご連絡します。";
    }
    if (/(なんで|どうして|返信|返事)/.test(compact) && isPartner) {
      return "いつも心配かけてごめんね。こちらも気になってることがあるから、また今度落ち着いて話そう。";
    }
    if (/(別れよう|終わりにしよう|もう連絡しない)/.test(compact)) {
      return "今すぐ結論を出すより、ちゃんと話せるタイミングで落ち着いて話したいと思ってる。また今度話そう。";
    }
    return "ちゃんと話したい気持ちはあるから、今日はこのへんにして、また落ち着いた時に話そう。";
  }

  if (score >= 40) {
    if (isBoss) {
      return "お疲れさまです。少し整理してから、必要な点だけ明日改めて共有します。";
    }
    if (/(寂しい|会いたい)/.test(compact) && isPartner) {
      return "ちょっと話したい気分だった。無理のないタイミングで連絡もらえたらうれしい。";
    }
    if (/(なんで|どうして)/.test(compact)) {
      return "連絡来なくて心配だったよ。落ち着いたときに話そう。";
    }
    return "うまく言えないけど、また落ち着いて話せたらうれしい。";
  }

  if (compact.length <= 40) return compact;
  return compact.slice(0, 80);
}

function ScoreBadge({ level, score }) {
  const styles =
    level === "高"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : level === "中"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className={`inline-flex min-h-[72px] items-center gap-3 rounded-2xl border px-5 py-3 text-base font-semibold  ${styles}`}>
      <span className="text-base">危険度は</span>
      <span className="text-base">{score}点</span>
      <span className="text-base">({level})</span>
      <span className="text-base">{level === "高" ? "危機一髪" : level === "中" ? "危険水域" : score === 0 ? "未入力" : "安心水準"}</span>
    </div>
  );
}

function OptionChips({ options, value, onChange }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((item) => {
        const selected = value === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={selected
              ? "rounded-full border border-neutral-900 bg-neutral-900 px-3 py-2 text-sm text-white"
              : "rounded-full bg-white/70 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            }
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default function AsamadeYuhoLP() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [recipient, setRecipient] = useState("恋人");
  const [message, setMessage] = useState("なんで返信くれないの？こっちはずっと気にしてたんだけど。もういいわ。");
  const [copied, setCopied] = useState(false);
  const [fitFeedback, setFitFeedback] = useState("");
  const [rewriteFeedback, setRewriteFeedback] = useState("");
  const [issueFeedback, setIssueFeedback] = useState([]);
  const [actionFeedback, setActionFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [submittedRecipient, setSubmittedRecipient] = useState("恋人");
  const [submittedMessage, setSubmittedMessage] = useState("なんで返信くれないの？こっちはずっと気にしてたんだけど。もういいわ。");
  const [hasJudged, setHasJudged] = useState(true);
  const resultRef = useRef(null);

  const result = useMemo(() => analyzeMessage(submittedRecipient, submittedMessage), [submittedRecipient, submittedMessage]);
  const showRewrite = hasJudged && result.score >= 40 && !!result.rewrite;

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const handleJudge = () => {
    setSubmittedRecipient(recipient);
    setSubmittedMessage(message);
    setHasJudged(true);
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const copyRewrite = async () => {
    if (!result.rewrite) return;
    try {
      await navigator.clipboard.writeText(result.rewrite);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const onWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setJoined(true);
    setEmail("");
  };

  const feedbackBaseClass = "rounded-full border px-3 py-2 text-sm transition";
  const feedbackClass = (selected) =>
    selected
      ? `${feedbackBaseClass} border-neutral-900 bg-neutral-900 text-white`
      : `${feedbackBaseClass} border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white text-neutral-950">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-12">
        <header className="relative flex min-h-[78vh] items-center overflow-hidden border-b border-neutral-200/60 bg-gradient-to-br from-blue-50 via-white to-white py-20 md:min-h-[92vh] md:py-28">
          <div className="absolute left-[8%] top-[18%] hidden h-28 w-28 rounded-full bg-blue-100/80 blur-2xl md:block" />
          <div className="absolute left-[36%] top-[6%] hidden h-40 w-40 rounded-full bg-blue-100/70 blur-3xl md:block" />

          <div className="relative max-w-5xl">
            <h1
              className="relative mt-6 max-w-4xl text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.05em] transition-all duration-1000 ease-out md:text-[3.5rem]"
              style={{
                transform: heroVisible ? "translateY(0px)" : "translateY(24px)",
                opacity: heroVisible ? 1 : 0,
              }}
            >
              <span className="relative z-10">そのメッセージ、<br />そのまま送って後悔しない？</span>
            </h1>
          </div>
        </header>

        <section className="pt-12 md:pt-16">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_420px] md:items-center">
            <div className="max-w-3xl">
              <div className="text-[11px] tracking-[0.28em] text-neutral-400 uppercase">Message before sending</div>
              <div className="mt-4 space-y-2 text-base font-bold leading-7 text-neutral-600 md:text-lg">
                <p>一時の感情で送ってしまったメッセージを後悔したくない。</p>
                <p>ちょっと保留では誰に何を送るかで危険度を100点満点で判定して、言い換えを提案。</p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#checker"
                  className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  今すぐ試す
                </a>
                <div className="text-sm text-neutral-500">感情のまま送る前に、一回だけ整える。</div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[420px]">
              <div className="rounded-[42px] bg-neutral-950 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.16)]">
                <div className="mx-auto h-1.5 w-20 rounded-full bg-white/20" />
                <div className="mt-4 rounded-[34px] bg-white text-neutral-950">
                  <div className="border-b border-neutral-200 px-6 py-5">
                    <div className="text-[11px] tracking-[0.22em] text-neutral-400 uppercase">Preview</div>
                    <div className="mt-1 text-sm font-medium">送信前のイメージ</div>
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="rounded-[24px] bg-neutral-50 p-5">
                      <div className="text-[11px] tracking-[0.18em] text-neutral-400 uppercase">Input</div>
                      <div className="mt-3 rounded-[20px] bg-white px-4 py-4 text-sm leading-7 text-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                        なんで返信くれないの？こっちはずっと気にしてたんだけど。もういいわ。
                      </div>
                    </div>
                    <div className="rounded-[24px] bg-rose-50 p-5">
                      <div className="text-[11px] tracking-[0.18em] text-rose-700 uppercase">Result</div>
                      <div className="mt-3 rounded-[20px] bg-white px-4 py-5 text-[15px] font-semibold text-rose-700 shadow-[0_1px_0_rgba(0,0,0,0.03)]">危険度は 82点（高）危機一髪</div>
                      <div className="mt-4 rounded-[20px] bg-white px-4 py-4 text-sm leading-7 text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                        いつも心配かけてごめんね。こちらも気になってることがあるから、また今度落ち着いて話そう。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] bg-white/40 p-6 md:p-8">
          <div className="text-[11px] tracking-[0.28em] text-neutral-400 uppercase">Concept</div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]" style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yuji Syuku", "Comic Sans MS", cursive' }}>送る前に、一回だけ整える</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 md:text-base">
            ちょっと保留は、感情を否定するためのものではありません。
            その場の勢いをそのまま相手にぶつける前に、言葉を少しだけ整えるためのサービスです。
          </p>
        </section>

        <section className="mt-10 border-b border-neutral-200/60 pb-10">
          <div className="mb-4 text-[11px] tracking-[0.28em] text-neutral-400 uppercase">3 STEP</div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            {[
              ["1", "誰に何を送るか入れる"],
              ["2", "危険度を数値化"],
              ["3", "推奨文章を作成"],
            ].map(([step, title], index) => (
              <React.Fragment key={title}>
                <div className="rounded-2xl bg-white/70 px-4 py-4">
                  <div className="text-[11px] tracking-[0.24em] text-neutral-400">STEP.{step}</div>
                  <div className="mt-2 text-sm font-bold text-neutral-950 md:text-base">{title}</div>
                </div>
                {index < 2 && <div className="hidden text-neutral-300 md:flex md:justify-center">—</div>}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-8 md:grid-cols-[500px_minmax(0,1fr)] md:items-start">
          <div className="md:sticky md:top-6">
            <div className="rounded-[42px] bg-neutral-950 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.16)]">
              <div className="mx-auto h-1.5 w-20 rounded-full bg-white/20" />
              <div className="mt-4 min-h-[760px] rounded-[34px] bg-white text-neutral-950">
                <div className="border-b border-neutral-200 px-6 py-5">
                  <div className="text-[11px] tracking-[0.22em] text-neutral-400 uppercase">Mobile Flow</div>
                  <div className="mt-1 text-sm font-medium">送る前の3STEP</div>
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-[26px] bg-neutral-50 p-6">
                    <div className="text-[11px] tracking-[0.18em] text-neutral-400 uppercase">STEP.1</div>
                    <div className="mt-2 text-base font-semibold text-neutral-950">誰に何を送るか入れる</div>
                    <div className="mt-5 space-y-3 text-sm text-neutral-700">
                      <div className="rounded-[20px] bg-white px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]">恋人</div>
                      <div className="rounded-[20px] bg-white px-4 py-4 leading-7 shadow-[0_1px_0_rgba(0,0,0,0.03)]">なんで返信くれないの？こっちはずっと気にしてたんだけど。もういいわ。</div>
                    </div>
                  </div>

                  <div className="rounded-[26px] bg-rose-50 p-6">
                    <div className="text-[11px] tracking-[0.18em] text-rose-700 uppercase">STEP.2</div>
                    <div className="mt-2 text-base font-semibold text-rose-950">危険度を数値化</div>
                    <div className="mt-5 rounded-[20px] bg-white px-4 py-5 text-[15px] font-semibold text-rose-700 shadow-[0_1px_0_rgba(0,0,0,0.03)]">危険度は 82点（高）危機一髪</div>
                    <div className="mt-4 text-sm leading-7 text-rose-950/90">いまの文面は本音より勢いが前に出ています。今は送らず、ちょっと保留がおすすめです。</div>
                  </div>

                  <div className="rounded-[26px] bg-blue-50/70 p-6">
                    <div className="text-[11px] tracking-[0.18em] text-blue-700 uppercase">STEP.3</div>
                    <div className="mt-2 text-base font-semibold text-neutral-950">推奨文章を作成</div>
                    <div className="mt-5 rounded-[20px] bg-white px-4 py-4 text-sm leading-7 text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                      いつも心配かけてごめんね。こちらも気になってることがあるから、また今度落ち着いて話そう。
                    </div>
                    <div className="mt-4 rounded-full bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white">文面をコピーする</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:pt-6">
            <div className="rounded-[28px] bg-white/70 p-6">
              <div className="text-[11px] tracking-[0.24em] text-neutral-400 uppercase">STEP.1</div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">まず、誰に何を送るか入れる</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600 md:text-base">
                送りたい相手と文面を入れるだけ。まだ送らずに、一回立ち止まるための画面です。
              </p>
            </div>

            <div className="rounded-[28px] bg-white/70 p-6">
              <div className="text-[11px] tracking-[0.24em] text-neutral-400 uppercase">STEP.2</div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">危険度が数値で見える</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600 md:text-base">
                感情の強さや誤解されやすさを見て、危険度を100点満点で判定。いま送る危うさが一目で分かります。
              </p>
            </div>

            <div className="rounded-[28px] bg-white/70 p-6">
              <div className="text-[11px] tracking-[0.24em] text-neutral-400 uppercase">STEP.3</div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">そのまま使える推奨文章まで</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600 md:text-base">
                責めすぎず、でも気持ちは残す。送る前に言葉を少し整えて、そのままコピペできる形で返します。
              </p>
            </div>
          </div>
        </section>

        <section id="checker" className="mt-10 rounded-[32px] bg-white/40 p-6 md:p-8">
          <div className="text-[11px] tracking-[0.28em] text-neutral-400 uppercase">Message Check</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] md:text-[2.2rem]" style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yuji Syuku", "Comic Sans MS", cursive' }}>送る前にチェックする</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
            誰に何を送るかを入れて「この内容で判定する」を押すと、危険度と推奨文章が表示されます。
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-[190px_1fr]">
            <div>
              <label className="mb-3 block text-sm text-neutral-700">誰に送る？</label>
              <OptionChips
                options={["恋人", "上司", "友達", "グループ"]}
                value={recipient}
                onChange={setRecipient}
              />
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="例: 恋人 / 上司 / 友達"
                className="mt-3 w-full rounded-2xl bg-white/70 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-300"
              />
            </div>
            <div>
              <label className="mb-3 block text-sm text-neutral-700">何を送る？</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ここに送る前の文面を貼ってください"
                className="min-h-[240px] w-full rounded-[24px] bg-white/70 px-5 py-4 text-sm leading-6 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-300"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="button"
              onClick={handleJudge}
              className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              この内容で判定する
            </button>
            {hasJudged ? <ScoreBadge level={result.level} score={result.score} /> : null}
          </div>

          {hasJudged ? (
            <div ref={resultRef} className="mt-6 rounded-[28px] bg-white/70 p-5 md:p-6 ">
              <div className="text-[11px] tracking-[0.28em] text-neutral-400 uppercase">Result</div>

              <div className="mt-5 rounded-2xl bg-white/40 p-5">
                <div className="text-[11px] tracking-[0.22em] text-neutral-400 uppercase">判定</div>
                <p className="mt-3 text-sm leading-7 text-neutral-800">{result.sendAdvice}</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-neutral-600">
                  {result.reasons.map((reason) => (
                    <li key={reason} className="flex gap-2">
                      <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-neutral-400" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl bg-white/40 p-5">
                <div className="text-[11px] tracking-[0.22em] text-neutral-400 uppercase">こう送るといいかも</div>
                <p className="mt-3 text-sm leading-7 text-neutral-800">{result.suggestion}</p>
              </div>

              {showRewrite ? (
                <div className={result.level === "高" ? "mt-4 rounded-2xl bg-rose-50/85 p-5" : "mt-4 rounded-2xl bg-white/40 p-5"}>
                  <div className={result.level === "高" ? "text-[11px] tracking-[0.22em] text-rose-700 uppercase" : "text-[11px] tracking-[0.22em] text-neutral-400 uppercase"}>推奨文章</div>
                  <div className={result.level === "高" ? "mt-3 rounded-2xl border border-rose-100 bg-white p-4 text-sm leading-7 text-rose-950" : "mt-3 rounded-2xl bg-white/70 p-4 text-sm leading-7 text-neutral-900"}>
                    {result.rewrite}
                  </div>
                  <button
                    type="button"
                    onClick={copyRewrite}
                    className="mt-4 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    {copied ? "コピーしました" : "文面をコピーする"}
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-emerald-50/80 p-5">
                  <div className="text-[11px] tracking-[0.22em] text-emerald-700 uppercase">このままでも大丈夫そう</div>
                  <div className="mt-3 rounded-2xl border border-emerald-100 bg-white p-4 text-sm leading-7 text-emerald-950">
                    このメッセージは比較的安全です。必要なら少しだけ短く整える程度で十分そうです。
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-white/70 p-5">
                <div className="text-[11px] tracking-[0.22em] text-neutral-400 uppercase">Feedback</div>
                <div className="mt-3 text-sm font-medium text-neutral-900">この判定、どれくらいしっくりきた？（1つ選択）</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "かなりしっくりきた",
                    "まあまあ",
                    "微妙",
                    "ぜんぜん違う",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFitFeedback(item)}
                      className={feedbackClass(fitFeedback === item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {showRewrite && (
                  <>
                    <div className="mt-6 text-sm font-medium text-neutral-900">この文、そのまま送れそう？（1つ選択）</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        "そのまま使える",
                        "少し直せば使える",
                        "使いづらい",
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setRewriteFeedback(item)}
                          className={feedbackClass(rewriteFeedback === item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-6 text-sm font-medium text-neutral-900">どこが微妙だった？（複数選択可）</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "かたすぎる",
                    "やさしすぎる",
                    "冷たすぎる",
                    "重すぎる",
                    "恋人っぽくない",
                    "上司っぽくない",
                    "点数が高すぎる",
                    "点数が低すぎる",
                  ].map((item) => {
                    const selected = issueFeedback.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setIssueFeedback((prev) =>
                            prev.includes(item)
                              ? prev.filter((value) => value !== item)
                              : [...prev, item]
                          )
                        }
                        className={feedbackClass(selected)}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 text-sm font-medium text-neutral-900">このあとどうした？（1つ選択）</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "そのまま送った",
                    "言い換えて送った",
                    "送らなかった",
                    "ちょっと保留にした",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setActionFeedback(item)}
                      className={feedbackClass(actionFeedback === item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-5 text-neutral-500">
                  いまは見た目だけのフィードバックUIです。保存や学習はあとでつなげられます。
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] bg-white/40 p-6 text-sm text-neutral-500">
              入力ができたら「この内容で判定する」を押してください。
            </div>
          )}
        </section>

        <section className="mt-10 space-y-6">
          <div className="rounded-[28px] bg-white/70 p-6 md:p-8">
            <div className="text-[11px] tracking-[0.28em] text-neutral-400 uppercase">Use cases</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]" style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yuji Syuku", "Comic Sans MS", cursive' }}>こんな時のために</h3>
            <div className="mt-5 space-y-3">
              {[
                "恋人に感情のまま連絡したくなる時",
                "上司や同僚に勢いで送ってしまいそうな時",
                "寂しさが強い言い方に変わってしまう時",
                "グループLINEで余計な一言を書きそうな時",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/40 p-4 text-sm text-neutral-700">
                  <div className="mt-1 h-2 w-2 rounded-full bg-neutral-900" />
                  <div>{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-neutral-950 p-6 text-white md:p-8">
            <div className="text-[11px] tracking-[0.28em] text-white/50 uppercase">Share</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]" style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yuji Syuku", "Comic Sans MS", cursive' }}>このページをシェアする</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              使ってみてよかったら、送信前に一回立ち止まりたい人へシェアしてください。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
              >
                リンクをコピー
              </button>
              <a
                href="https://twitter.com/intent/tweet?text=そのメッセージ、そのまま送って後悔しない？%20ちょっと保留&url="
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Xでシェア
              </a>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/45">
              公開後は、ページURLをXやLINE、メモなどに貼って使えます。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
