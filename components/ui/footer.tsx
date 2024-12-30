import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core";
import {
  fab,
  faGithub,
  faLinkedin,
  faCodepen,
} from "@fortawesome/free-brands-svg-icons";
library.add(fab);
export default function Footer() {
  return (
    <footer className="space-y-12 text-center pb-16">
      {/* Initials logo */}
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 138.83504 81.488462"
          className="logo-svg m-auto"
          width="180px"
        >
          <path
            className="logo-bg"
            fill="#FFF"
            d="M139.41751544 52.49688057c.00085383.89737283-.39489527 1.7341239-1.0882033 2.29893087-.559684.4576516-1.28116834.70995766-2.02698677.70995766-1.00965116 0-1.93946944-.45039407-2.54696779-1.2273772-1.23378091-1.56634677-2.57429027-2.7360906-3.66761654-3.5459461-.14600452.03031087-.29414362.04610669-.44484419.04610669-.15667737 0-.31292782-.01664964-.46875136-.05208349l-2.7015106-.60109464c-.03884915.40599503-.0836751.7850945-.13533167 1.1377253 1.0480734 1.48608697 1.8856783 3.67444716 1.63764137 6.1855542-.21132233 2.13115373-1.28970662 5.24847837-5.23823244 7.99481491-.15070058.10587463-.31378166.19125739-.48796249.25444063-6.1642085 2.26392394-9.8147485 5.4465664-12.48039832 7.77111209-1.64319126 1.43229583-3.02511126 2.63747351-4.532117 3.22874914l-.42862147 1.39771582c-.27706707.90548419-1.11211048 1.52322847-2.0590053 1.52322847h-.01152668c-.4482595-.00256148-.87047726-.14301613-1.22054658-.38593008l-.02646866.1084361c-.23010654.97250966-1.09844923 1.65727941-2.09486607 1.65727941h-.01835729c-.772714-.00554988-1.46431437-.42264467-1.84042544-1.06173464-.39062613.36885353-.91658395.58871414-1.47968326.58871414-.03543385 0-.06958695-.00170765-.1050208-.00256148-.75094139-.0371415-1.40881557-.45893235-1.76656934-1.08350725-.19083048.06147559-.3927607.0956287-.60066773.10245931-.01963804 0-.0401299.00085383-.05763337.00085383-.94091804 0-1.7742538-.61091366-2.05687074-1.5117018-.01408815-.04269138-.28816682-.92597605-.59426402-2.31814199-1.61159963-1.49462525-1.17059767-3.88747715-.8905422-5.40643649.02689556-.15112749.05720644-.3060972.08282127-.45807852.11227833-.64037071.40898343-1.09503392.8405933-1.44851855-2.37321388.48113186-4.60511927.93408741-5.89269133 1.19749323l-.41666787 1.035266c-.3308582.82138216-1.12662555 1.3511822-1.99966429 1.3511822-.06275633 0-.12935488-.0034153-.19424578-.0093921-.30865869-.02732249-.599387-.11996278-.85852368-.26468656-.36415748.72276508-1.10741442 1.18468582-1.92196597 1.18468582-.0683062 0-.1361855-.00341531-.20491863-.0093921-.65702035-.06232942-1.22780411-.41666788-1.5795811-.93494125-.31506239.17546158-.67495073.2719441-1.04721957.2719441-.09819018 0-.198088-.0064037-.29798584-.02049187-.66598554-.0930672-1.22951177-.485401-1.55610084-1.0356929-.07769831.00853828-.15539662.01323433-.23394876.01323433-.04738744 0-.09477487-.00128074-.14386996-.00512297-.96098298-.06361015-1.76315403-.7573451-1.96465735-1.69954387-.00811136-.03884916-.16735022-.79363278-.3214661-1.9783186-.53108078-.64378602-.81241698-1.46431437-.80772093-2.3958403.00341531-.84870466.23437568-1.67905202.4576516-2.48079615.03500694-.12722032.0708677-.25700211.10672846-.38678391.06019484-.2288258.1451507-.43417135.25187915-.6211596-1.307637.0802598-2.6430234.1203897-4.00487846.1203897-3.15916219 0-6.16079319-.21217617-8.8691344-.5225425.23992556.1455776.4542363.34067722.62585565.57932204.31122016.43374443.4422827.95116396.39702984 1.45406843.27749398.16436182.52040793.39190688.70568853.67537765.31591622.4824126.41624096 1.05319637.3125009 1.59025394.30993943.37184193.49692768.85169305.49692768 1.37423556 0 .49948915-.1699117.95884841-.45509012 1.32428663-.10288623.13661242-.41069109.53961906-.87517331 1.08137269-.15198132.73685323-.60365613 1.60818432-1.74565057 2.33906076-.22711815.15240823-.79790191.46149383-3.31455882 1.6538641-.28902065.13746625-.60450996.20833394-.92213383.20833394-.08154054 0-.16308108-.00554988-.24504853-.01408816-3.20654962-.36629205-6.12834774-.9614099-14.55861475-5.3078194-.07172152-.03671458-.13960081-.07812522-.20577245-.12124352-5.18999119 5.21944824-11.19410701 8.89517615-22.82409303 9.96502216-.16009267.02006494-.82437056.1208166-1.6201379.24504852l-.28645917 1.07155367c-.2471831.91957234-1.06856527 1.56933516-2.02058306 1.59623073-.02006495.00085383-.04098373.00170766-.0619025.00170766-.36330366 0-.71166533-.0926403-1.01818902-.2565752-.22199432.94988322-1.05746465 1.63636063-2.03680493 1.6632562-.02091878 0-.04098373.00170766-.06147559.00170766-.7018463 0-1.34307085-.34110414-1.74010069-.8841385-.38550317.34366561-.8905422.54602276-1.43485731.54602276h-.03884916c-.71550755-.01323433-1.35843974-.3769649-1.743516-.94219878-.16350799.05122966-.33598117.08196745-.51400423.09349412-.04141064.00213457-.0832482.00384223-.12508574.00384223-.91103407 0-1.73070859-.57761439-2.0338174-1.44723782-.01408815-.04226447-.3154893-.91146098-.65445887-2.27758517-1.3849084-1.65172954-.7266073-4.7481354-.22327592-7.11195717.07983288-.37354958.1481391-.69416185.1852806-.91018024.08879807-.5255309.37013427-.9985514.78936363-1.32898269 4.40617743-3.47422458 8.36879142-4.28237243 10.15627826-4.46765302 1.0049551-1.07027292 3.15403923-3.46995545 5.2523206-6.5317813-5.13577313-2.87611833-9.05953668-7.5802816-11.15269509-13.42345092-2.44365465-6.82976713-2.10596582-14.3314966.92811062-20.58279552 5.76290825-11.86350787 19.87924029-18.2390387 23.06487114-19.18123749.17076552-.05122965.37056118-.11057067.5938371-.17844997C33.83191122 2.85278126 40.45035602.84585944 47.78217379.84585944c.57761439 0 1.15522877.0123805 1.71662043.03671459 8.0498868.35604612 14.02966854 6.95058374 15.54734713 8.79228991 2.6306429 1.16334014 9.05099969 4.01341673 9.8181638 4.44417277 1.5761658.88627307 1.8267642 2.64174265 1.39985039 3.9848135l-.23949865 1.18127051c-.0153689.08538276-.03842224.17033861-.06659855.25444063-.0619025.18570751-.12892797.36501131-.20022258.53663066 1.70765524.34964241 3.45458655.5255309 5.20834848.5255309 2.44664305 0 4.9953185-.34195796 7.5768663-1.0173356 3.15531997-.8252244 6.38833826-1.24402685 9.60598764-1.24402685 5.04868272 0 9.90269274 1.05191563 14.04162213 3.04304164 4.5658432 2.19732538 8.14380784 5.4132671 10.63228843 9.55646563.02049187.03500694.04098373.06958696.05976794.1050208.45295555.85980442.86962343 1.7371123 1.24701524 2.62509302.09520178.02518791.18997664.05635262.28219003.09520178 9.81560232 4.08214985 15.00388585 10.56014 15.0055935 18.73169724z"
          />
          <path
            className="logo-fill"
            fill="#000"
            d="M47.86915747 3.00093316c-7.6287961-.01801576-14.53945059 2.27104913-16.84558349 2.95504616-2.4731117.73001835-16.23382027 6.72303441-21.73758457 18.05545296C3.90389213 35.09495581 8.02873379 50.396883 20.15477956 55.97493458c1.77553454-2.5345873 3.43697636-5.58836582 4.52261818-9.12278098-.68263519 3.27015551-2.23372833 6.51199384-3.97980154 9.36292.46723155.19947974.94618615.38560562 1.43583068.55615342-.48984944-.1706161-.96847105-.35657122-1.43583068-.55615343-3.36109243 5.49096116-7.4459788 9.5313503-7.4459788 9.5313503l-.05753517-.03752573c-.6113363.00683063-4.79932022.1958766-9.69644384 4.0590154-.25785552 1.5027366-1.49354302 5.8795253-.15175463 6.47208166.37824521 1.67349787.75460346 2.7557628.75460346 2.7557628l.60451679-2.70656952h1.04560541l.7704458 3.55372448.87634092-3.44116012 1.30158678-.05586167.99807796 3.83138495.75627098-3.77552328 1.5425617-.11256436.81713821 2.47977156.6503733-2.42306887s2.86860893-.4547059 3.12347648-.47861307c11.49976449-1.0540502 16.98844592-4.64659394 22.0285861-9.86988014l-.00917865-.0049949c0 .00042692.18009359-.21463091.51863624-.62702965.96055607-1.1740087 3.19247001-3.95515153 6.15439376-7.99545956-.73395023-.27922298-1.47911547-.58174691-2.21961882-.91219528.74073815.33057217 1.48627054.63205017 2.22045557.91135853 1.56079262-2.12858799 3.32396373-4.60553338 5.21134968-7.38260771-.32189301.71508063-.64885776 1.41317436-.98056979 2.09538263-.64390983 1.5988221-1.53948108 3.04791273-2.35052767 4.49260187.17460775.06403707.36934021.1361855.58450477.2134569 2.8376961.80344752 20.37265574 5.38727233 35.77654703.72708545v-.00085383c.4235113-.12827906.846442-.26500248 1.26740037-.40773684-.2880046-.28588283-.56688177-.56886692-.83881733-.8479917.27193556.27912905.55081274.56167341.83881733.8479917l.00085383.00085383c1.30550243-.44270962 2.59037638-.9546177 3.8480602-1.54589333-.30993943-.9242684-.57593661-1.9207322-.78128216-3.00423944 2.9232667 9.66838536 10.24906926 11.35138633 13.4244371 11.61755855-.25195172.8931848-.7521709 1.63331247-1.39747674 2.25130436-2.61313516 2.50854128-7.56129675 3.04036062-7.6927862 3.7938635-.32829673 1.85749771-.7837796 3.5457668.62119374 4.22327474.35177698 1.78449973.71541362 2.94420683.71541362 2.94420683l.72542049-2.84497925 1.10897266.04000182.69457169 3.78802332 1.03226478-3.60958615 1.39664-.01169744.90969356 4.09487188.94388082-3.97313314 1.62177298-.06337108.78795482 2.65737197.77878471-2.54564009c3.54551493-.34110413 6.86234066-7.16141513 17.97874082-11.24484572l-6.63717777-2.23545732 6.63884273 2.23545732c6.07113703-4.22430788 4.66211227-9.60915107 2.53480075-11.82184108-.010374-.01075822-.021303-.01942458-.031677-.03001204.0108436.01105707.02254105.01797307.03334197.0292009.21854571-.975767.36982262-2.3889371.4210779-4.3825392l5.17716242 1.154836-.89885422-1.2632337s3.62667124 1.67740413 6.70471554 5.58323431c.5592571.71678829 1.81521618.43458972 1.81521618-.44442581-.0029884-7.98413354-5.66560733-13.41222737-13.67791718-16.74385847.04397212.17076552.09033496.3411767.1317456.51279606.34860074 1.54213222.57498033 2.83513034.74626242 4.24245599.1361855 1.42589212.20759965 2.8604506.10172502 4.28164667-.0341531-1.31147922-.21316233-2.60823846-.45693012-3.8864184.21217617 1.3481938.34157374 2.7650567.37188462 4.25413207.0078979.78171761.00085383 1.4864157-.01417354 2.13957248.01344779-.65554323.02126031-1.35519946.01331972-2.14040923-.03031089-1.4890711-.15887171-2.90510151-.37104787-4.25329533-.0217726-.10886302-.03991644-.21965996-.06170186-.32852298-.28090928-1.38319647-.66877329-2.73853255-1.12898637-4.06068462-.5344961-1.54414299-1.18717473-3.03659097-1.94195835-4.46675224-6.26580545-10.43418762-19.84998943-13.52992323-31.88595767-10.38100697-5.97977746 1.56420793-10.99487487 1.26821151-15.1320966.20178081-.78766452 3.09736642-2.58631217 4.98575563-5.21801808 6.11768771-.45039407.15923885-.90775965.2837995-1.38163398.37772053-.22327592.04824126-.46084492.08721422-.70290505.11923276-.10331314.01323433-.2067885.02561483-.31351696.03586076-.13191637.30225498-.28676654.59801233-.48528147.8755063-.26980952.40129898-.59411033.76362073-.98473647 1.05477595-.75563744.59084872-1.64660656.88966277-2.50811863 1.05060927-.87005034.16180034-1.7339019.19460013-2.57065297.18093888-.69928482-.01280741-1.3830556-.06225684-2.069533-.12757465-.00042691.00001708-.00128074-.00001708-.00170765 0-.15198132-.01451507-.30285693-.0296705-.45526516-.0450266-1.65044879-.18399985-3.29543735-.45850543-4.92368235-.74709917l-2.4489185-.44942497c-.81199007-.148566-1.62216575-.32524856-2.44141335-.42941553-3.23600241-.43545208-6.57089514-.0838288-9.75481406.77127957-1.59281543.4269138-3.16208656.98140654-4.6810459 1.63928072-1.51767432.6642779-3.0083933 1.41226077-4.41422048 2.31133699 1.3878968-.93365624 2.8655266-1.724497 4.37253235-2.42890478 1.50913605-.70013865 3.05886307-1.29590968 4.65936294-1.7693571 3.18562658-.94390643 6.55246527-1.39249892 9.88238872-1.03559898.83034736.0926403 1.6543764.23619434 2.46892794.35103415l2.45975784.3485367c1.62739544.22327593 3.27259746.43094388 4.89700024.54364913.81497846.05720645 1.64124026.0896391 2.44724926.07170871.8034518-.01793038 1.60257895-.08686415 2.35052767-.2584835.76289498-.17247318 1.47394982-.459022 2.01783801-.92136539.54602276-.45594395.93474486-1.08617119 1.14649411-1.81021701l.00832482-.03086587c.01579581-.1080092.0158385-.17009954.0158385-.17009954l.00170766-.00085383c-.0000128.00384223-.00042691.06546724-.0158385.17009954l.06003689-.1834406h-.00085383l.0592044-.18427307.44775575-.04000182c.10758228-.0093921.2406812-.02740787.37772053-.04919328h.00085383c.32635-.1066943.75066817-.25228899 1.24739092-.43191724-.50179449.18160486-.91859471.32442888-1.24739092.43191724.06958695-.01067285.13894764-.0218153.20511928-.03334197.21559147-.03756841.4160275-.0821809.6136886-.13341057.411118-.10075165.80124465-.22982478 1.19485918-.3852214.44484419-.18186529.87151039-.40502594 1.27323628-.66288188.28219003-.18101146.55322053-.37591469.80296511-.59534412.60450996-.52980004 1.07875997-1.1749223 1.4074836-1.9011027.33170777-.72319199.50268248-1.5228229.54281238-2.34719347l.04085565-.51863197.49111737-.23013216c.25486755-.1144129.496441-.3441096.69623666-.67539045.15027366-.2505984.27977797-.54787984.38522568-.86550371l.26598438-1.32159709s.4195965-1.09645554-.37104787-1.54172665c-.7914982-.44441727-10.1175243-4.56681229-10.1175243-4.56681229s-6.0360746-8.0311282-14.28660235-8.39485877c-.51381639-.02288258-1.02563481-.03381158-1.5342215-.03500694zM69.4157963 26.04927547c-.68113244.27125677-1.275849.49683375-1.78603235.6828956.5107725-.18618992 1.10371309-.4111308 1.78603235-.6828956zm-16.79055003 5.57906336c-1.74373373.02360833-3.49718401.07744216-5.15465126.25431682 1.65751848-.17681916 3.41093461-.23076399 5.15465126-.25431682zm-8.67919191.89885422c-1.81595047.51701397-3.355978 1.33554435-4.41255553 2.6348608-3.57753345 4.38098525-5.4898469 8.39652374-5.4898469 8.39652374h-.00170766s1.91230918-4.01553849 5.48984264-8.39652374c1.05688064-1.29968786 2.5975955-2.11782549 4.41422476-2.6348608zm76.85282343 6.02181994s.3006327.41570305.6887315 1.12231798c-.38859829-.70809205-.68939322-1.12011938-.69040074-1.1214855zm-.41357276.13341056c-.57671786.18779512-7.16827136 2.33144463-15.1145846 4.87448908 7.90492822-2.53111221 14.76323027-4.7600591 15.1145846-4.87448908zm1.63177558 2.05452271c.64833266 1.43882762 1.28692314 3.45819825 1.18235488 5.7108047.10449996-2.24852943-.53522185-4.2723485-1.18235488-5.7108047zm-18.0996428 3.25354857c-4.13483956 1.32077314-8.45612091 2.69038095-12.31546445 3.89142184 3.8586007-1.20077194 8.1803047-2.57056332 12.31546444-3.89142184zm-61.7449115.70874523c1.5367958.50152127 2.79055628 1.2233386 3.18517833 2.2621437l-8.35900655 5.57656165c.55451408.55888995 1.16527405 1.07139144 1.81605292 1.54172665-.65097952-.47044194-1.2622219-.98185053-1.8168854-1.54089417l-.00085383-.00085383 8.35817407-5.57656164c-.39449398-1.03846784-1.6465596-1.76064378-3.1826766-2.2621437zm-8.29896966 2.4697647c.2966923.89342388.69788882 2.06565662 1.04226738 3.0417609-.34989002-.99116153-.74255253-2.1384497-1.04226738-3.0417609zm89.24166155.19344319c-.00781252.05641666-.0153689.11264974-.02416332.16926278.00879442-.05652765.01639349-.11292724.02416332-.16926278zm-.23013216 1.15733772c-.00917865.03479348-.01874152.06937776-.02834708.10422674.00960556-.03479348.01916843-.06946742.02834708-.10422674zm-88.30945682.2859981c.12573893.34733707.27086828.6818582.43274972 1.00475019-.16186864-.3229048-.30702787-.65739604-.43274972-1.0047502zm87.93007132.85716182c-.0123805.03086586-.024761.06165489-.03752572.09255491.01276472-.03090856.02514522-.06168478.03752572-.09255491zm-87.47564291.19177822c.1633671.32167102.3429484.63180682.53864569.93053976-.19568021-.2987372-.37529566-.6088602-.5386457-.93053976zm45.70312558.55699018c.00170766.00042691.00469606.00170765.00665986.00256148-.00213457-.00085383-.00461067-.00170766-.00665986-.00256148zm41.23387164.3818872c-.01169744.02117493-.01895497.04222178-.03086587.0633711-.00085382.00015795-.00170765-.00016223-.00256148 0 .0119109-.02113224.02164453-.04222178.03334197-.0633711zm-86.37083693.03253084c.2005513.30292523.41613423.59478059.6462109.8755063-.22991017-.28058056-.44579622-.57275183-.6462109-.8755063zm86.82776705.031677c.00341531.00042692.00730023.00170766.01084361.00256149-.0034153-.00085383-.00730022-.00170766-.0108436-.00256149zm-40.89617427.0183573c.01741808.01131321.01711924.00832482.03500693.02002226-.00042692.0001238-.00128074.00085382-.00170766.00085382h-.00085382c-.01127053-.00734291-.02147377-.01366124-.03253084-.0208334zm-.2042868.08421729c-.03586076.00969094-.07424031.02061993-.10923017.03001204l-.00085383-.00085383c.0362023-.00952018.07308765-.01921112.11006265-.0292009zm41.60909045.06420356c.01814384.0084102.03598884.01771693.05419671.02668212-.01810114-.0089225-.0361596-.01827191-.0541967-.02668212zm-42.15690625.0758754c-.50031737.12763869-.86341184.20792837-1.05977938.2309689.19578694-.02292527.5591461-.10338144 1.05977938-.2309689zm42.71139045.25931598c.01225243.00909327.02446216.01818653.0366719.02753594-.01216705-.00926403-.02450486-.01844267-.0366719-.02753594zm-43.86956066.069207c.18875567.1941177.62190243.71040166 1.25572428 1.44667002-.6246304-.72636823-1.07858493-1.26792548-1.25572428-1.44667002zm-43.36927317.2793297c.23572473.28716358.48534124.56330424.74793165.82881048-.2625648-.26553186-.5122368-.54162129-.74793165-.82881048zm-.68373235.2351356c.00170766.0034153.00926403.02480369.01084361.02749324h-.00085382c-.00085383-.00170765-.00883712-.02544406-.00998979-.02749325zM24.80997582 53.5910692c-.00478144.00636102-.00952018.01276473-.01417354.01916843.00465336-.0064464.0093921-.01280741.01417354-.01916843zm-.18761154.32102211c-.00341531.0074283-.00610487.01502737-.00917865.02249836.0029884-.007471.0059768-.01507006.00917865-.02249836zm14.19321921.16759783c.32529979.23508435.66014964.46009782 1.00308096.67539045-.34294413-.21527983-.67776836-.4403189-1.00308096-.67539045zm-14.29494424.18843975c-.00128074.00828213-.00213457.01664964-.0034153.02501715.00128073-.00836751.00213456-.01673502.0034153-.02501715zm16.34946696 1.10564273c.71277956.39415672 1.4482624.753473 2.18876575 1.08395978-.74051188-.33047398-1.47596911-.68982014-2.18876575-1.08395978zm-16.07013725.18510556c.0059341.0113986.01220973.02271182.0183573.0341958-.00610487-.01148398-.0124232-.0227972-.0183573-.0341958zm.31434945.50946187c.0088798.01263664.01758884.02565752.0266821.03833686-.00909326-.01272204-.0178023-.02570022-.0266821-.03833686zm58.82822352.21262442c-.02595636.20917496-.07266926.41055874-.13758151.60451422.06490798-.19392986.11162515-.39536915.13758151-.60451422zm-58.39297209.3401948c.17244757.1982417.36673604.40435996.58700649.61869204-.2204156-.21447296-.41447781-.4203308-.58700649-.61869203zm-3.41531048.15008583c.48965733.17053499.99053823.32607676 1.50253596.4661045-.51201054-.14001066-1.01292132-.2955866-1.50253596-.4661045zm61.65319332.16593286c-.0678793.19188921-.15365908.37661482-.2551493.55448419.10162256-.17801879.18719743-.36241994.2551493-.5544842zm5.47983579.25847923c-.78893672.44142888-1.8436956.85680321-3.08344903 1.2457217-1.50401736.47131284-3.27941528.90180845-5.18217013 1.29158076-2.82872664 1.57915419-6.68967537 2.29355176-6.88648263 3.05260024-.42221776 1.56335837-.94500787 2.9709487.20595176 3.66212216.16478873 1.55439318.38271969 2.57648888.38271969 2.57649315l.8479917-2.37554482.93220473.12173874.30851354 3.29690594 1.16484287-3.00423944 1.19902585.10172929.46776947 3.5745664 1.0973051-3.32108633 1.39997419.07504291.47694384 2.3346849.85049342-2.11122113s8.00873231-1.63242022 12.93915563-2.61901804c-.52339633-.2813362-1.07612164-.6167325-1.64178244-1.02059296-1.941604-1.38319647-4.02195073-3.54515204-5.47900756-6.88148347zm-65.62966066.04166679c.51227095.14007896 1.03550933.26474633 1.570078.3727171.53456866.1079665 1.07997666.19920652 1.636779.27348953-.55690906-.074283-1.10215911-.16552303-1.636779-.27348953-.53435522-.10791527-1.05805466-.23272353-1.570078-.3727171zm22.63477382.87384134c-2.33223014 3.95492526-4.44694343 6.83504378-5.45232545 8.14054195 8.46782688 4.36647018 11.03200357 4.7649131 13.81633116 5.08211007 0 0 2.83865239-1.34510296 3.03759422-1.49836502.54858425-.3402503.96266076-.77632569.8371481-1.41498875.80131722-.88328467 1.28074143-1.5375557 1.28074143-1.5375557l-1.775193.69290246-.41274028-.62869889 1.73350487-1.84940343-2.30216687.81380445-.55782266-.77211205 1.81021701-2.09121168-2.45725612 1.01141858-.655381-.88384393 1.0889632-1.46334954-1.63844824.55115427s-1.37408613-1.55087115-1.48252224-1.69431419c-.05122966-.0525104-.11566376-.10343268-.17927392-.15508925-3.11689345-.89096912-5.60573266-1.85858635-6.6913702-2.30299935zm55.19278348 4.85364287c-.0049095.20264318-.02185798.39855393-.05003003.58783897.028219-.18950704.0451248-.38493964.05003003-.58783897zm-.05836765.63870148c-.0297559.185985-.0698431.36546384-.11840028.54031066.04848887-.17463336.08867854-.35456473.11840028-.54031066z"
          />
          <path
            className="logo-stroke"
            fill="#FFF"
            d="M46.50179096 4.61695562c-1.70577682.01921112-3.44100215.20403492-5.15039066.5078097-5.09305614.9024958-19.9185219 3.56734303-28.72656067 16.52539387 7.41203914-9.71822328 26.1062747-14.39952958 27.92578136-14.62109785 2.01116961-.24203879 8.03240895-.24331099 10.77148368 1.21289202 2.73735428 1.45747947 7.49023268 5.5820304 7.49023268 5.5820304s8.39566564.97241147 7.10937433 5.09765827C64.652514 23.04731575 56.98118022 22.0760655 48.583824 22.31812562c-8.39735196.24248704-32.75889395 10.78745453-27.9023438 23.61913888-3.24070273-15.49774402 23.75789441-20.02736785 30.33789135-18.57031102 6.56803055 1.45662992 11.60321425.99068338 11.61132561.54882759-2.58153073.37909946-5.08812528-2.57731282-8.10937297-1.85155935 3.1053497-2.11279217 9.57059648-1.56250027 12.1269521-1.56250027 2.55805048 0 2.73828068-1.69921943 2.73828068-1.69921943s.36357261-1.69846805-.36132704-3.39843884c-.72703422-1.69740931 1.28710672-2.91015618 1.28710672-2.91015618s-4.91342789-2.6449872-8.0136717-3.85742242c0 0-1.42207552-2.26748866-5.49609266-5.19140427-2.93031932-2.10353242-6.54808514-2.87035073-10.30078133-2.82812469zM12.62483963 21.65015919c-.73428706.96267357-1.35835138 1.97451906-1.84375024 3.03710754.57889299-1.07198058 1.19441903-2.0816915 1.84375024-3.03710754zM39.2127286 9.71460962c-.59178365.0029884-1.16056946.2155872-1.67382658.55664011-.57035259.3927607-1.0640784 1.01124782-1.28906199 1.73828204-.2441947.72575347-.22115843 1.50858106 0 2.17968957.21303.67108716.58219944 1.2539355 1.11328022 1.68554537.00341531-.6958695-.02727979-1.30347886-.00977632-1.86913966.01664964-.56309931.09393384-1.06371552.24804973-1.52734392.15582354-.4636284.37696062-.90806275.70312277-1.35546842.3150624-.45082099.70683693-.89400875 1.16406162-1.3964863-.08538276-.00836752-.17131624-.01216705-.25585798-.01174014zm12.68359222 3.34375119c-.33400455.00007684-.7288486.0536161-1.20312423.17968802 1.57872727.23693716 2.0175776.75781044 2.0175776.75781044s-.17888116.99083706-1.08007487 1.59961189c1.26791267-.18399985 1.80663948-.58984547 1.80663948-.58984547s.60705436.24317865 1.44335717.41992096c-1.15264595-.7607604-1.18073687-2.36760849-2.98437515-2.36718584zm46.92968739 10.46875056c-2.86515092.04406605-5.70775226.54468226-8.49218659 1.035155-3.18646333.56694153-6.35493651 1.1336568-9.48632796 1.19726697-2.70789296.06617164-5.3770947-.27602967-7.88476508-1.09570418-.43673283.74368386-1.00533506 1.40177576-1.66406307 1.92773358-.09776327.07855214-.20131121.1446512-.30078213.21679964 1.60348827.50288739 3.2592308.8373957 4.91992551.99023085 1.68756895.1579581 3.3742798.13785474 5.03710909-.01366124 3.32521032-.3026819 6.51227987-1.114625 9.64452942-1.89843876 3.1271223-.78039844 6.26263775-1.55838055 9.45507787-1.67578185 1.59238851-.058056 3.19350314.05838046 4.76367079.41015744 1.55652775.34580019 3.08870007.93004881 4.5175806 1.70703195-1.38192001-.87645405-2.8768868-1.57110259-4.43554911-2.0351579-1.57145266-.46917828-3.21617227-.70249521-4.84570228-.75585944-.41015744-.01370393-.8192049-.01605196-1.22851706-.00977633zm25.24804987 14.40429395c.10416697.54687659.1961669 1.09466677.2734383 1.64453176 1.48008883.53321535 2.91922382 1.1970407 4.29687468 2.00390781 1.1334391.6647048 2.21607117 1.42047886 3.22655908 2.27343557 1.02160048.85681602 1.9898282 1.7942419 2.79882986 2.87304883-.698431-1.16376277-1.57476124-2.2116398-2.50586026-3.191407-.94732174-.97463995-1.98296342-1.869161-3.07031289-2.67773575-1.56120246-1.15393095-3.24956546-2.12787931-5.01952877-2.92578122zM75.351401 51.68726842c-2.08376631.89649765-4.2782826 1.44095364-6.48242152 1.8046842-2.19305197.3581807-4.43351273.5267476-6.65429702.54297033-2.2225133.01494199-4.44337443-.12048361-6.63085945-.435546-2.0833394-.30695103-4.16293048-.77389655-6.07421934-1.5175804-.27279792.5630993-.44251324 1.00373413-.71829956 1.54249936l-.22310516.45554691c2.27884457.70526162 4.57898787 1.02221097 6.85742261 1.16992315 2.28653329.14045464 4.57496635.09298183 6.84569956-.10937532 2.25538565-.20193023 4.51137753-.56097328 6.7167972-1.10742296 2.18408678-.54899408 4.35678777-1.28099758 6.36328268-2.34569928zm26.31249968 14.47460664c-.29841275.77314091-.88221739 1.3365348-1.52343766 1.78906344-.64506677.4576516-1.36007055.81458143-2.09179655 1.13476679-.73471867.31591622-1.48997616.59137808-2.25585954.83984192-.76502954.25230606-1.5452871.48130263-2.32226597.687502l-.14062541.03709881-.00781252.1191431c-.06659856.8461261-.1173885 1.69366955-.1425764 2.54491861.18101145-.78379668.33549875-1.5693437.47851487-2.35742233.78082536-.10160548 1.54581649-.26950642 2.30273467-.47655961.79405969-.22498358 1.57920115-.49765343 2.33398476-.85156498.75307596-.34964241 1.48280828-.7777772 2.11718512-1.33788811.31335474-.28219003.60442457-.59629187.82812741-.95703404.2275408-.3556192.38668572-.76203688.42382722-1.17187414zm-86.54101759.87304728c-.27486418.00085383-.54928438.00636102-.82421687.01758885-1.0997257.05336423-2.19792733.19934314-3.27929532.44140327-1.08008767.24248704-2.13849196.59538253-3.15625021 1.04492278-1.0134887.4700321-1.9835231 1.00512587-2.84375016 1.7812509l-.07226541.06445119-.01562505.07226797c-.2360812 1.10484867-.44776684 2.2148758-.62109384 3.3359344.40385833-1.01988003.76961801-2.04983094 1.1132815-3.08593368.4064198-.2629789.86284446-.51640348 1.31835936-.73242187.4772875-.22797197.95967877-.44667992 1.45703122-.63281434.9848859-.39233379 2.00349285-.70089428 3.03320298-.97070381 1.02971014-.271086 2.0754099-.4895805 3.13671763-.67187269 1.05831934-.18954973 2.13031699-.33149003 3.21679556-.4941442-.81487174-.12229372-1.63823479-.17206334-2.46289139-.16992023z"
          />
        </svg>
      </div>
      <div className="space-y-6">
        {/* Social icons */}
        <ul className="inline-flex gap-4">
          <li>
            <a
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              href="https://www.linkedin.com/in/kyle-r-ross/"
              aria-label="linkedin"
            >
              <FontAwesomeIcon
                className="stoke-1 hover:fill-black"
                icon={faLinkedin}
                size="sm"
              />
            </a>
          </li>
          <li>
            <a
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              href="https://github.com/badger3000"
              aria-label="GitHub"
            >
              <FontAwesomeIcon
                className="stoke-1 hover:fill-black"
                icon={faGithub}
                size="sm"
              />
            </a>
          </li>
          <li>
            <a
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              href="https://codepen.io/badger3000"
              aria-label="Codepen"
            >
              <FontAwesomeIcon
                className="stoke-1 hover:fill-black"
                icon={faCodepen}
                size="sm"
              />
            </a>
          </li>
        </ul>
        {/* Copyright notes */}
        <p className="text-sm text-gray-400 dark:text-gray-600">
          &copy; Kyle Ross. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
