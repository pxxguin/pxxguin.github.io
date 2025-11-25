---
title: Start with RLHF Algorithms
published: 2025-11-25
description: Training language models to follow instructions with human feedback에 대한 리뷰입니다.
tags: [Paper Review]
category: Paper
draft: true
---

### 🤦🏻‍♂️ 들어가기에 앞서...
요즘에는 RLVR(Reinforcement Learning with Verifiable Rewards) 등과 같은 강화학습 알고리즘을 사용하는 것도 사실이지만, 가장 많이 사용되었고 지금도 쓰이는 RLHF(Reinforcement Learning with Human Feedbacks)에 대해서 배워보도록 합시다. 총 68개의 페이지로 되어있고, 설명할 내용이 많을 것 같기는 한데, 한번 천천히 리뷰해보자구요. [논문](https://arxiv.org/pdf/2203.02155)을 통해 많은것들을 배울 수 있기를 바랍니다.


### Abstract
> In this paper, we show an avenue for aligning language models with user intent on a wide range of tasks by fine-tuning with human feedback.
>
> In human evaluations on our prompt distribution, outputs from the 1.3B parameter InstructGPT model are preferred to outputs from the 175B GPT-3, despite having 100x fewer parameters. Moreover, InstructGPT models show improvements in truthfulness and reductions in toxic output generation while having minimal performance regressions on public NLP datasets.
>
> 

:::tip
대부분 논문에서 Abstract 부분에 실험을 설계하게 된 이유, 결과 등 중요한 내용들이 포함될 확률이 높습니다. 시간이 없는 사람이라면 Abstract, 실험 결과만 봐도 대충 논문의 내용은 알 수 있죠.
:::