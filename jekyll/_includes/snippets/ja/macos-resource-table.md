| クラス                   | vCPU         | RAM   |
| --------------------- | ------------ | ----- |
| medium                | 4 @ 2.7 GHz  | 8 GB  |
| macos.x86.medium.gen2 | 4 @ 3.2 GHz  | 8 GB  |
| large                 | 8 @ 2.7 GHz  | 16 GB |
| macos.m1.large.gen1   | 8 @ 3.2 GHz  | 12GB  |
| macos.x86.metal.gen1  | 12 @ 3.2 GHz | 32 GB |
{: class="table table-striped"}

 `medium`および`large`リソースクラスは、2023年10月2日に非推奨になります。 Xcode v14.2は、macOSリソースでサポートされる最新バージョンです。 詳しくは[お知らせ](https://discuss.circleci.com/t/macos-resource-deprecation-update/46891)をご覧ください。
{: class="alert alert-warning"}
`macos.x86.metal.gen1` リソースは、最低 24 時間の利用が必要です。 このリソースクラスの詳細については、[macOS の専有ホスト]({{ site.baseurl }}/ja/dedicated-hosts-macos)を参照して下さい。
<br />
<br />
`注:` `large` リソースクラスは、年間契約のお客様のみご利用いただけます。 年間契約プランの詳細については、[サポートチケットをオープン](https://support.circleci.com/hc/ja/requests/new)しお問い合わせください。
{: class="alert alert-info"}
