import type { Locale } from "@/lib/i18n";

export type AboutContent = {
  intro: { title: string; text: string };
  sections: { title: string; paras: string[] }[];
};

export const ABOUT: Record<Locale, AboutContent> = {
  az: {
    intro: {
      title: "Bir şirkət, inteqrasiya olunmuş həllər",
      text: "CyberSpace MMC 1998-ci ildə Bakıda kompüter və İT avadanlıqlarının təchizatı üzrə fəaliyyətə başlayıb. Şirkət zamanla fəaliyyətini genişləndirərək mühəndislik sistemlərinin layihələndirilməsi, quraşdırılması və inteqrasiyası üzrə ixtisaslaşıb. Bu gün CyberSpace mexaniki və elektrik sistemlərini, avtomatlaşdırmanı, İT infrastrukturunu, zəif axın və yanğın təhlükəsizliyi sistemlərini bir layihə çərçivəsində əlaqələndirir.",
    },
    sections: [
      {
        title: "Mühəndislik və avtomatlaşdırma",
        paras: [
          "Mexaniki sistemlər üzrə fəaliyyətimiz isitmə, ventilyasiya, kondisionerləşdirmə və su təchizatı sistemlərini əhatə edir. Layihənin tələblərinə uyğun olaraq hava emalı qurğuları, çillerlər, qazanxanalar və nasos stansiyaları üçün həllər hazırlayırıq.",
          "Elektrik sistemləri üzrə alçaq və orta gərginlikli paylayıcı avadanlıq, elektrik panoları, kabel xətləri, işıqlandırma və ehtiyat enerji təchizatı ilə işləyirik.",
          "Avtomatlaşdırma sahəsində binaların idarəetmə sistemlərini (BMS), dispetçer nəzarəti və məlumat toplama sistemlərini (SCADA), eləcə də proqramlaşdırılan məntiqi kontrollerlərə (PLC) əsaslanan idarəetmə həllərini tətbiq edirik. Bu sistemlər vasitəsilə avadanlığın işinə mərkəzləşdirilmiş qaydada nəzarət etmək, texnoloji göstəriciləri izləmək və nasazlıq siqnallarını vaxtında görmək mümkündür.",
        ],
      },
      {
        title: "İT infrastrukturu, zəif axın və yanğın təhlükəsizliyi",
        paras: [
          "İT infrastrukturu üzrə korporativ şəbəkələri, server otaqlarını və strukturlaşdırılmış kabel sistemlərini layihələndirir və qururuq. Zəif axın sistemlərinə IP videomüşahidə, girişə nəzarət, turniketlər, IP telefoniya və səsli elan sistemləri daxildir.",
          "Yanğın təhlükəsizliyi üzrə yanğının aşkarlanması, siqnalizasiya, səsli xəbərdarlıq və təxliyənin idarə olunması sistemlərini layihələndirir və quraşdırırıq. Obyektin təyinatına uyğun olaraq su, köpük və qaz əsaslı avtomatik yanğınsöndürmə sistemləri üzrə həllər təqdim edirik. Layihədə nəzərdə tutulduqda yanğın siqnalizasiyasını tüstüyə nəzarət, ventilyasiya və digər mühəndislik sistemləri ilə əlaqələndiririk.",
        ],
      },
      {
        title: "Layihə təcrübəmiz və iş yanaşmamız",
        paras: [
          "Layihə təcrübəmiz yaşayış komplekslərini, otelləri, biznes mərkəzlərini, dövlət obyektlərini, sənaye müəssisələrini və kommunal infrastrukturu əhatə edir. Bu təcrübəyə su təchizatı və kanalizasiya obyektlərində nasosların avtomatlaşdırılması, sənaye proseslərinə nəzarət və müxtəlif təyinatlı binalarda mühəndislik sistemlərinin inteqrasiyası daxildir.",
          "İşə obyektin texniki vəziyyətini, mövcud infrastrukturu və sifarişçinin istismar tələblərini öyrənməklə başlayırıq. Avadanlıq seçimində sistemlərin uyğunluğunu, istismar şəraitini və texniki xidmət imkanlarını nəzərə alırıq. Layihənin iş həcminə uyğun olaraq layihələndirmə, avadanlıq təchizatı, montaj, sınaq və sazlama işlərini həyata keçiririk. Təhvil mərhələsində sistemlərin işini və nəzərdə tutulmuş qarşılıqlı əlaqəni yoxlayırıq. Sifarişçilər bizə ayrıca bir sistem üzrə və ya bir neçə mühəndislik istiqamətini əhatə edən layihə üçün müraciət edə bilərlər.",
          "Təhvildən sonra razılaşdırılmış servis proqramı çərçivəsində planlı baxış, nasazlıqların diaqnostikası və texniki dəstək göstəririk. Məqsədimiz mühəndislik sistemlərinin birgə etibarlı işləməsini və istismar dövründə onlara rahat texniki xidmət göstərilməsini təmin etməkdir.",
        ],
      },
    ],
  },

  ru: {
    intro: {
      title: "Одна компания, комплексные решения",
      text: "Компания CyberSpace начала работу в Баку в 1998 году с поставок компьютеров и ИТ-оборудования. Со временем компания расширила сферу деятельности и стала специализироваться на проектировании, монтаже и интеграции инженерных систем. Сегодня CyberSpace объединяет в рамках одного проекта механические и электротехнические системы, автоматизацию, ИТ-инфраструктуру, слаботочные системы и противопожарную защиту.",
    },
    sections: [
      {
        title: "Инженерные системы и автоматизация",
        paras: [
          "Мы работаем с системами отопления, вентиляции, кондиционирования и водоснабжения. В зависимости от требований проекта мы разрабатываем решения для вентиляционных установок, чиллеров, котельных и насосных станций.",
          "Наши электротехнические работы охватывают распределительное оборудование низкого и среднего напряжения, электрические щиты, кабельные линии, освещение и резервное электроснабжение.",
          "В области автоматизации мы внедряем системы управления зданиями (BMS), системы диспетчерского управления и сбора данных (SCADA), а также решения на базе программируемых логических контроллеров (ПЛК). Эти системы позволяют централизованно контролировать работу оборудования, отслеживать технологические параметры и своевременно получать сигналы о неисправностях.",
        ],
      },
      {
        title: "ИТ-инфраструктура, слаботочные системы и противопожарная защита",
        paras: [
          "Мы проектируем и создаём корпоративные сети, серверные помещения и структурированные кабельные системы. В состав слаботочных решений входят IP-видеонаблюдение, контроль доступа, турникеты, IP-телефония и системы громкоговорящей связи.",
          "Мы проектируем и монтируем системы обнаружения пожара, пожарной сигнализации, оповещения и управления эвакуацией. С учётом назначения объекта мы предлагаем решения по автоматическому водяному, пенному и газовому пожаротушению. Если это предусмотрено проектом, мы интегрируем пожарную сигнализацию с противодымной вентиляцией, общеобменной вентиляцией и другими инженерными системами.",
        ],
      },
      {
        title: "Опыт проектов и подход к работе",
        paras: [
          "Наш опыт охватывает жилые комплексы, гостиницы, бизнес-центры, государственные объекты, промышленные предприятия и коммунальную инфраструктуру. Мы автоматизируем работу насосов на объектах водоснабжения и водоотведения, внедряем системы контроля промышленных процессов и интегрируем инженерные системы зданий различного назначения.",
          "Работу мы начинаем с изучения технического состояния объекта, существующей инфраструктуры и требований заказчика к эксплуатации. При подборе оборудования учитываем совместимость систем, условия эксплуатации и возможности технического обслуживания. В зависимости от объёма проекта мы выполняем проектирование, поставку оборудования, монтаж, испытания и пусконаладку. Перед сдачей проверяем работу систем и предусмотренное проектом взаимодействие между ними. Заказчики могут обратиться к нам как по отдельной системе, так и по проекту, объединяющему несколько инженерных направлений.",
          "После сдачи объекта мы проводим плановые осмотры, диагностируем неисправности и оказываем техническую поддержку в рамках согласованной программы обслуживания. Наша цель — обеспечить надёжную совместную работу инженерных систем и упростить их обслуживание на протяжении всего срока эксплуатации.",
        ],
      },
    ],
  },

  en: {
    intro: {
      title: "One Company, Integrated Solutions",
      text: "CyberSpace began operating in Baku in 1998 as a supplier of computers and IT equipment. Over time, we expanded into the design, installation and integration of engineering systems. Today, CyberSpace brings mechanical and electrical systems, automation, IT infrastructure, extra-low-voltage systems and fire protection together within a single project.",
    },
    sections: [
      {
        title: "Engineering and Automation",
        paras: [
          "Our mechanical services cover heating, ventilation, air conditioning and water supply systems. Depending on the project, we develop solutions for air handling units, chillers, boiler rooms and pumping stations.",
          "Our electrical work covers low- and medium-voltage distribution equipment, switchboards, cabling, lighting and backup power.",
          "We implement building management systems (BMS), supervisory control and data acquisition systems (SCADA), and control solutions based on programmable logic controllers (PLCs). These systems give operators a central point for monitoring equipment, tracking process parameters and receiving fault alerts.",
        ],
      },
      {
        title: "IT Infrastructure, ELV and Fire Protection",
        paras: [
          "We design and install corporate networks, server rooms and structured cabling systems. Our extra-low-voltage (ELV) solutions include IP video surveillance, access control, turnstiles, IP telephony and public address systems.",
          "We design and install fire detection, alarm, emergency notification and evacuation control systems. We provide automatic water-based, foam and gaseous fire suppression solutions suited to the facility. Where required by the project, we integrate fire alarm systems with smoke control, ventilation and other building services.",
        ],
      },
      {
        title: "Project Experience and How We Work",
        paras: [
          "Our experience spans residential developments, hotels, business centres, public-sector facilities, industrial plants and utility infrastructure. This includes pump automation for water supply and wastewater facilities, industrial process monitoring, and the integration of engineering systems across different building types.",
          "We start by reviewing the condition of the site, the existing infrastructure and the client’s operating requirements. When selecting equipment, we consider system compatibility, operating conditions and ease of maintenance. Depending on the scope, we handle design, equipment supply, installation, testing and commissioning. Before handover, we verify each system’s operation and check how connected systems work together. Clients can engage us for a single system or for a project that brings several engineering disciplines together.",
          "After handover, we provide scheduled inspections, fault diagnosis and technical support under the agreed maintenance programme. Our aim is to deliver engineering systems that work reliably together and are straightforward to maintain throughout their service life.",
        ],
      },
    ],
  },
};
