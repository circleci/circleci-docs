| 変数                                        | タイプ   | 値                                                                                                                                                     |
| ----------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CI`{:.env_var}                           | ブール値型 | `true` (現在の環境が CI 環境かどうかを表します)                                                                                                                        |
| `CIRCLECI`{:.env_var}                     | ブール値型 | `true` (現在の環境が CircleCI 環境かどうかを表します)。                                                                                                                 |
| `CIRCLE_BRANCH`{:.env_var}                | 文字列型  | 現在ビルド中の Git ブランチの名前。                                                                                                                                  |
| `CIRCLE_BUILD_NUM`{:.env_var}             | 整数型   | 現在のジョブの番号。 この番号はジョブごとに一意です。                                                                                                                           |
| `CIRCLE_BUILD_URL`{:.env_var}             | 文字列型  | CircleCI での現在のジョブの URL                                                                                                                                |
| `CIRCLE_JOB`{:.env_var}                   | 文字列型  | 現在のジョブの名前。                                                                                                                                            |
| `CIRCLE_NODE_INDEX`{:.env_var}            | 整数型   | (並列実行を有効化してジョブを実行する場合) 並列実行の現在のインデックスです。 0 から "`CIRCLE_NODE_TOTAL` - 1" までの値を取ります。                                                                    |
| `CIRCLE_NODE_TOTAL`{:.env_var}            | 整数型   | (並列実行を有効化してジョブを実行する場合) 並列実行の総数です。 設定ファイルの `parallelism` の値と等しくなります。                                                                                   |
| `CIRCLE_OIDC_TOKEN`{:.env_var}            | 文字列型  | CircleCI が署名した OpenID Connect トークン。現在のジョブの詳細情報を含みます。 コンテキストを使用しているジョブで使用可能です。                                                                         |
| `CIRCLE_PR_NUMBER`{:.env_var}             | 整数型   | 関連付けられた GitHub または Bitbucket プル リクエストの番号。 フォークしたプルリクエストのみで使用可能です。                                                                                     |
| `CIRCLE_PR_REPONAME`{:.env_var}           | 文字列型  | プル リクエストが作成された GitHub または Bitbucket リポジトリの名前。 フォークしたプルリクエストのみで使用可能です。                                                                                 |
| `CIRCLE_PR_USERNAME`{:.env_var}           | 文字列型  | プル リクエストを作成したユーザーの GitHub または Bitbucket ユーザー名。 フォークしたプルリクエストのみで使用可能です。                                                                                |
| `CIRCLE_PREVIOUS_BUILD_NUM`{:.env_var}    | 整数型   | 任意のブランチで現在のジョブ番号よりも小さい最大のジョブ番号です。 **注**: 変数は常に設定されるわけではなく、決定論的ではありません。 ランナー Executor には設定されません。 この変数は廃止予定であり、使用を避けることをお勧めします。                         |
| `CIRCLE_PROJECT_REPONAME`{:.env_var}      | 文字列型  | 現在のプロジェクトのリポジトリの名前。                                                                                                                                   |
| `CIRCLE_PROJECT_USERNAME`{:.env_var}      | 文字列型  | 現在のプロジェクトの GitHub または Bitbucket ユーザー名。                                                                                                                |
| `CIRCLE_PULL_REQUEST`{:.env_var}          | 文字列型  | 関連付けられたプル リクエストの URL。 ひも付けられたプルリクエストが複数ある時は、そのうちの 1 つがランダムで選ばれます。                                                                                     |
| `CIRCLE_PULL_REQUESTS`{:.env_var}         | リスト   | 現在のビルドに関連付けられたプル リクエストの URL の一覧 (カンマ区切り)。                                                                                                             |
| `CIRCLE_REPOSITORY_URL`{:.env_var}        | 文字列型  | GitHub または Bitbucket リポジトリ URL。                                                                                                                       |
| `CIRCLE_SHA1`{:.env_var}                  | 文字列型  | 現在のビルドの前回のコミットの SHA1 ハッシュ。                                                                                                                            |
| `CIRCLE_TAG`{:.env_var}                   | 文字列型  | git タグの名前 (現在のビルドがタグ付けされている場合)。 For more information, see the [Git Tag Job Execution]({{site.baseurl}}/workflows/#executing-workflows-for-a-git-tag). |
| `CIRCLE_USERNAME`{:.env_var}              | 文字列型  | パイプラインをトリガーしたユーザーの GitHub または Bitbucket ユーザー名 （そのユーザーが CircleCI のアカウントを持っている場合のみ）                                                                     |
| `CIRCLE_WORKFLOW_ID`{:.env_var}           | 文字列型  | 現在のジョブのワークフロー インスタンスの一意の識別子。 この ID は Workflow インスタンス内のすべてのジョブで同一となります。                                                                                |
| `CIRCLE_WORKFLOW_JOB_ID`{:.env_var}       | 文字列型  | 現在のジョブの一意の識別子。                                                                                                                                        |
| `CIRCLE_WORKFLOW_WORKSPACE_ID`{:.env_var} | 文字列型  | 現在のジョブの [workspace]({{site.baseurl}}/glossary/#workspace) の識別子。 この識別子は、特定のワークスペース内のすべてのジョブで同じです。                                                      |
| `CIRCLE_WORKING_DIRECTORY`{:.env_var}     | 文字列型  | 現在のジョブの `working_directory` キーの値。                                                                                                                     |
| `CIRCLE_INTERNAL_TASK_DATA`{:.env_var}    | 文字列型  | **内部用**。 ジョブ関連の内部データが格納されるディレクトリ。 データ スキーマは変更される可能性があるため、このディレクトリのコンテンツは文書化されていません。                                                                   |
{: class="table table-striped"}
