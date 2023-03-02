| クラス                   | vCPU         | RAM   |
| --------------------- | ------------ | ----- |
| medium                | 4 @ 2.7 GHz  | 8 GB  |
| macos.x86.medium.gen2 | 4 @ 3.2 GHz  | 8 GB  |
| large                 | 8 @ 2.7 GHz  | 16 GB |
| macos.x86.metal.gen1  | 12 @ 3.2 GHz | 32 GB |
| macos.m1.large.gen1   | 8            | 12GB  |
{: class="table table-striped"}

 The `medium` and `large` resource classes are being deprecated on October 2, 2023. Xcode v14.2 is the latest version that will be supported by these macOS resources. See our [announcement](https://discuss.circleci.com/t/macos-resource-deprecation-update/46891) for more details.
{: class="alert alert-warning"}
`macos.x86.metal.gen1` リソースは、最低 24 時間の利用が必要です。 このリソースクラスの詳細については、[macOS の専有ホスト]({{ site.baseurl }}/ja/dedicated-hosts-macos)を参照して下さい。
<br />
<br />
The `large` and `macos.m1.large.gen1` resource classes are only available for customers with an annual contract. 年間契約プランの詳細については、[サポートチケットをオープン](https://support.circleci.com/hc/ja/requests/new)しお問い合わせください。
{: class="alert alert-info"}
