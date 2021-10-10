(require '[clojure.string :as string])
(require '[cheshire.core :as json])
(require '[clj-keyczar.crypt :as crypt])
(require '[circle.model.project :as project])

(defn decrypt-or-encrypt-vals
  [project direction]
  (let [crypt (let [c (case direction
                        :decrypt crypt/decrypt
                        :encrypt crypt/encrypt)]
                #(some-> % c))
        old-keyword #(keyword (str (case direction
                                     :encrypt "decrypt"
                                     :decrypt "encrypt")
                                   "ed-"
                                   %))
        new-keyword #(-> %
                         name
                         (string/replace #"^..crypt" (name direction))
                         keyword)]
    (reduce-kv
      (fn [p k v]
        (if (or (.startsWith (name k) (name (old-keyword "")))
                (= :aws k))
          (assoc p
                 (new-keyword k)
                 (cond
                   (nil? v)
                   v

                   (= :aws k)
                   (if (empty? v)
                     v
                     (-> v
                         (assoc (new-keyword :--crypted-aws-keypair)
                                (crypt ((old-keyword "aws-keypair") v)))
                         (dissoc (old-keyword "aws-keypair"))))


                   (= (old-keyword "ssh-keys") k)
                   (map #(-> %
                             (assoc (new-keyword :--crypted-private-key)
                                    (crypt ((old-keyword "private-key") %)))
                             (dissoc (old-keyword "private-key")))
                        v)

                   (= (old-keyword "checkout-ssh-keys") k)
                   (map #(-> %
                             (assoc-in [:encrypted-keypair
                                        (new-keyword :--crypted-private-key)]
                                       (crypt
                                         (get-in %
                                                 [:encrypted-keypair
                                                  (old-keyword "private-key")])))
                             (update :encrypted-keypair
                                     (fn [m] (dissoc m (old-keyword "private-key")))))
                        v)

                   (map? v)
                   (reduce-kv #(assoc %1 %2 (crypt %3)) {} v)

                   (string? v)
                   (crypt v)

                   :else
                   (throw (Exception. (str "Don't know how to " direction
                                           " key " k
                                           " with value " v)))))
          (assoc p k v)))
      {}
      project)))

(defn export-settings
  "save project settings to a json file

  either the projects indicated by given by a vector of github urls, or all
  projects if this function is called with no second argument"
  ([filename vcs-urls]
   (-> (project/where (if vcs-urls
                {:vcs_url {:$in vcs-urls}}
                {})
              ; not included: :follower_ids :follower_ids_count :github-info
              ; :next_build_seq :encrypted-env-vars :has-service-hook
              ; :last-handled-event-time :branches :github-hook
              :only [:vcs_url :features :github-id :aws :encrypted-ssh-keys
                     :encrypted-checkout-ssh-keys :tokens
                     :encrypted-env-vars-map :setup :dependencies :test :extra
                     :encrypted-flowdock-settings :encrypted-slack-settings
                     :encrypted-irc-settings :parallel])
       (->> (map #(do
                    (println "decrypting settings for" (:vcs_url %))
                    (decrypt-or-encrypt-vals % :decrypt))))
       ; drop the mongo ids. dropping :user-id means that we'll lose who keys
       ; belong to, but I don't see any easy way around that
       (->> (clojure.walk/prewalk #(if (map? %) (dissoc % :_id :user-id) %)))
       (json/generate-stream (clojure.java.io/writer filename))))
  ([filename] (export-settings filename nil)))

(defn import-settings
  "import project settings from given json file"
  [filename]
  (->> (json/parse-stream (clojure.java.io/reader filename) true)
       (map #(decrypt-or-encrypt-vals % :encrypt))
       (map #(do (println "importing settings for" (:vcs_url %))
                 (if-let [project (project/find-one-by-vcs_url (:vcs_url %))]
                   (project/set-fields! project %)
                   (project/create! %))))
       doall)
  (println "finished importing project settings"))
