Class | vCPUs | RAM | Cloud | Server
---|---|---|---|---
medium* | 4 @ 2.7 GHz | 8GB | <i class="fa fa-check" aria-hidden="true"></i> | <i class="fa fa-times" aria-hidden="true"></i>
macos.x86.medium.gen2* | 4 @ 3.2 GHz | 8GB | <i class="fa fa-check" aria-hidden="true"></i> | <i class="fa fa-times" aria-hidden="true"></i>
large* | 8 @ 2.7 GHz | 16GB | <i class="fa fa-check" aria-hidden="true"></i> | <i class="fa fa-times" aria-hidden="true"></i>
macos.m1.medium.gen1 | 4 @ 3.2 GHz | 6GB | <i class="fa fa-check" aria-hidden="true"></i> | <i class="fa fa-times" aria-hidden="true"></i>
macos.m1.large.gen1 | 8 @ 3.2 GHz | 12GB | <i class="fa fa-check" aria-hidden="true"></i> | <i class="fa fa-times" aria-hidden="true"></i>
macos.x86.metal.gen1* | 12 @ 3.2 GHz | 32GB | <i class="fa fa-check" aria-hidden="true"></i> | <i class="fa fa-times" aria-hidden="true"></i>
{: class="table table-striped"}

**すべての Intel ベースの macOS リソースのサポートを終了します。**
<br>
<br>
`medium` および `large` リソースクラスは、2023年10月2日に非推奨になります。 Xcode v14.2は、macOSリソースでサポートされる最新バージョンです。
<br>
<br>
`macos.x86.metal.gen1` リソースクラスは2023年10月2日に非推奨となります。Xcode v14.0.1は、これらのmacOSリソースでサポートされる最新バージョンです。
<br>
<br>
`macos.x86.medium.gen2` リソースクラスは、2024年1月31日に非推奨となります。Xcode v15.1がこのmacOSリソースでサポートされる最新バージョンです。
<br>
<br>
詳しい情報はこちらの[お知らせ](https://discuss.circleci.com/t/macos-intel-support-deprecation-in-january-2024/48718) をご覧ください。
{: class="alert alert-warning"}

`macos.x86.metal.gen1` リソースは、最低 24 時間の利用が必要です。 このリソースクラスの詳細については、link:https://circleci.com/docs/ja/dedicated-hosts-macos/[macOS の専有ホスト]を参照して下さい。
<br>
<br>
`large` リソースクラスは、年間契約のお客様のみご利用いただけます。 年間契約プランの詳細については、link:https://support.circleci.com/hc/ja/requests/new[サポートチケット]をオープンしお問い合わせください。 
{: class="alert alert-info"}
